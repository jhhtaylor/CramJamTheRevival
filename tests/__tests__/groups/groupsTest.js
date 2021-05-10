const groups = require('../../../src/controllers/groups')
const { GroupSchema } = require('../../../src/db/groups')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const { getGeoData } = require('../../../seeds/locationHelper')
const { app } = require('../../../utils/testUtils/expressTestUtils')
const supertest = require('supertest')
const request = supertest.agent(app)

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
beforeEach(async () => {
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})
})
// will change once there is access to database
describe('Group controller functionality', () => {
  test('A group can be added to the database', async () => {
    const testName = 'New Test Group'
    const req = { body: { name: testName } }
    const res = { redirect (url) { return url } }
    await groups.createGroup(req, res)
    const expectedGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(expectedGroup.name)
  })

  test('A student can delete a group through the delete request', async (done) => {
    const data = {
      name: 'New Group Test Name'
    }

    const req = { body: { name: data.name } }
    const res = { redirect (url) { return url } }
    await groups.createGroup(req, res)

    const expectedGroup = await GroupSchema.findOne({ name: data.name })

    expect(data.name).toEqual(expectedGroup.name)

    const response = await request
      .delete(`/groups/${expectedGroup._id}`)
    expect(response.status).toBe(302) // 302 is redirect
    const group = await GroupSchema.findOne({ name: data.name })

    expect(group).toEqual(null)
    done()
  })

  test('A student can delete a group member through the delete request', async (done) => {
    // generate a random set of user profile data
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata

    const newStudent = new StudentProfile({
      email: 'test.member@test.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })

    const member = await newStudent.save()

    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: [member._id]
    })
    await newGroup.save()
    const group = await GroupSchema.findById(newGroup._id)
    expect(group.members[0]).toEqual(member._id)
    const response = await request
      .delete(`/groups/${group._id}/edit/${group.members[0]}`)
    expect(response.status).toBe(302) // 302 is redirect
    const groupUpdated = await GroupSchema.findById(newGroup._id)
    expect(groupUpdated.members[0]).toEqual(undefined)
    done()
  })

  test('A student can be invited to a group', async (done) => {
    // create group
    const testName = 'New Test Group'
    const req = { body: { name: testName } }
    const res = { redirect (url) { return url } }
    await groups.createGroup(req, res)
    const testGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(testGroup.name)

    // create student
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test.member@test.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const testStudent = await newStudent.save()

    // create request to invite student to group
    const request = { params: { id: testGroup._id, member: testStudent._id } }
    const response = { redirect (url) { return url } }
    await groups.inviteGroupMember(request, response)

    const expectedGroup = await GroupSchema.findOne({})
    const expectedStudent = await StudentProfile.findOne({})
    expect(testStudent._id).toEqual(expectedGroup.invites[0])
    expect(testGroup._id).toEqual(expectedStudent.invites[0])
    done()
  })
})
