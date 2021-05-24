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

    const res = { redirect(url) { return url } }
    await groups.createGroup(req, res)
    const expectedGroup = await GroupSchema.findOne({})
    expect(expectedGroup.name).toEqual(testName)
    expect(expectedGroup.members[0]).toEqual(testUser._id)
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
    const res1 = { redirect(url) { return url } }
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
    const res2 = { redirect(url) { return url } }
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

    const res1 = { redirect(url) { return url } }
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
    const res2 = { redirect(url) { return url } }
    await groups.deleteGroupMember(req2, res2)
    const updatedGroup = await GroupSchema.findById(expectedGroup._id)
    expect(updatedGroup).toEqual(null)
    const updatedUser = await StudentProfile.findById(testUser._id)
    expect(updatedUser.groups[0]).toEqual(undefined)
  })

  test('A user can be added to a group', async (done) => {
    // generate a test user profile
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

    // generate a test group
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: []
    })
    await newGroup.save()

    const req = { params: { member: testStudent._id, id: newGroup._id } } // One can validate in controllers/groups.js that (req, res) are correct
    const res = { redirect: function (url) { return url } }
    await groups.addGroupMember(req, res) // test actual function
    const expectedMember = await GroupSchema.findById(newGroup._id)
    expect(expectedMember.members).toContainEqual(testStudent._id)
    done()
  })

  test('A student can be invited to a group', async (done) => {
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
    // create group
    const testName = 'New Test Group'
    const req = {
      body: { name: testName },
      user: testStudent
    }
    const res = { redirect(url) { return url } }
    await groups.createGroup(req, res)
    const testGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(testGroup.name)

    // create request to invite student to group
    const request = {
      params: { id: testGroup._id, member: testStudent._id },
      user: testStudent
    }
    const response = { redirect(url) { return url } }
    await groups.inviteGroupMember(request, response)

    const expectedGroup = await GroupSchema.findOne({})
    const expectedStudent = await StudentProfile.findOne({})
    expect(testStudent._id).toEqual(expectedGroup.invites[0])
    expect(testGroup._id).toEqual(expectedStudent.invites[0])
    done()
  })

  test('A student can only view the groups page if logged in', async (done) => {
    const response = await request.get('/groups')
    expect(response.status).toBe(302) // redirect since user is not logged in
    done()
  })

  test('A student can view a specific group page', async (done) => {
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
    // create group
    const testName = 'New Test Group'
    const req = {
      body: { name: testName },
      user: testStudent
    }
    const res = { redirect(url) { return url } }
    await groups.createGroup(req, res)
    const testGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(testGroup.name)

    const response = await request.get(`/groups/${testGroup._id}`)
    expect(response.status).toBe(200)
    done()
  })

  test('A student can view an explore page page', async (done) => {
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
    // create group
    const testName = 'New Test Group'
    const req = {
      body: { name: testName },
      user: testStudent
    }
    const res = { redirect(url) { return url } }
    await groups.createGroup(req, res)
    const testGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(testGroup.name)

    const response = await request.get(`/groups/${testGroup._id}/explore`)
    expect(response.status).toBe(200)
    done()
  })
})
