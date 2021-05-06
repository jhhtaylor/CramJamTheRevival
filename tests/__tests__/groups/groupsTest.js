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

    const testUser = await newStudent.save()

    const testName = 'New Test Group'
    const req = {
      body: { name: testName },
      user: testUser
    }

    const res = { redirect (url) { return url } }
    await groups.createGroup(req, res)
    const expectedGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(expectedGroup.name)
    expect(testUser._id).toEqual(expectedGroup.members[0])
  })

  test('A group can be deleted', async () => {
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

    const testUser = await newStudent.save()

    const testName = 'New Test Group'
    const req1 = {
      body: { name: testName },
      user: testUser
    }
    const res1 = { redirect (url) { return url } }
    await groups.createGroup(req1, res1)
    const expectedGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(expectedGroup.name)

    const req2 = {
      body: { name: testName },
      user: testUser,
      params: {
        id: expectedGroup._id
      }

    }
    const res2 = { redirect (url) { return url } }
    await groups.deleteGroup(req2, res2)
    const updatedGroup = await GroupSchema.findById(expectedGroup._id)
    expect(updatedGroup).toEqual(null)
    const updatedUser = await StudentProfile.findById(testUser._id)
    expect(updatedUser.groups[0]).toEqual(undefined)
  })

  test('The last group member removed from a group deletes the group', async () => {
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

    const testUser = await newStudent.save()

    const testName = 'New Test Group'
    const req1 = {
      body: { name: testName },
      user: testUser
    }

    const res1 = { redirect (url) { return url } }
    await groups.createGroup(req1, res1)
    const expectedGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(expectedGroup.name)

    const req2 = {
      body: { name: testName },
      user: testUser,
      params: {
        id: expectedGroup._id,
        member: testUser._id
      }

    }
    const res2 = { redirect (url) { return url } }
    await groups.deleteGroupMember(req2, res2)
    const updatedGroup = await GroupSchema.findById(expectedGroup._id)
    expect(updatedGroup).toEqual(null)
    const updatedUser = await StudentProfile.findById(testUser._id)
    expect(updatedUser.groups[0]).toEqual(undefined)
  })
})
