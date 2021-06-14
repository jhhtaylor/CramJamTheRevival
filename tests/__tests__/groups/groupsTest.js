const groups = require('../../../src/controllers/groups')
const { GroupSchema } = require('../../../src/db/groups')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const { getGeoData } = require('../../../seeds/locationHelper')
const { app } = require('../../../utils/testUtils/expressTestUtils')
const supertest = require('supertest')
const request = supertest.agent(app)
const Mongoose = require('mongoose')

let testStudent
let testGroupName
let extraMember1
let extraMemberId1

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
beforeEach(async () => {
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})

  const data = getGeoData()
  const location = data.location
  const geodata = data.geodata

  testStudent = new StudentProfile({
    email: 'test.member@test.com',
    firstName: 'Member',
    lastName: 'Test',
    password: '',
    groups: [],
    location,
    geodata
  })
  await testStudent.save()

  extraMemberId1 = Mongoose.Types.ObjectId()
  extraMember1 = { _id: extraMemberId1 }

  testGroupName = 'Test Group'
})
// will change once there is access to database
describe('Group controller functionality', () => {
  test('A student cannot view groups page if not logged in', async (done) => {
    const response = await request.get('/groups')
    expect(response.status).toBe(302) // redirect since user is not logged in
    done()
  })

  test('A student can view an explore page group if logged', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: testStudent._id
    })
    const testGroup = await newGroup.save()
    const response = await request.get(`/groups/${testGroup._id}/explore`)
    expect(response.status).toBe(200)
    done()
  })

  test('A group can be added to the database', async () => {
    const req = {
      body: { name: testGroupName },
      user: testStudent
    }
    const res = { redirect (url) { return url } }
    await groups.createGroup(req, res)
    const expectedGroup = await GroupSchema.findOne({})
    expect(expectedGroup.name).toEqual(testGroupName)
    expect(expectedGroup.members.length).toEqual(1)
    expect(expectedGroup.members[0]).toEqual(testStudent._id)
  })

  test('A group can be deleted', async () => {
    const newGroup = new GroupSchema({
      name: testGroupName,
      members: testStudent._id
    })
    const testGroup = await newGroup.save()

    const req = {
      body: { name: testGroup.name },
      user: testStudent,
      params: {
        id: testGroup._id
      }
    }
    const res = { redirect (url) { return url } }

    const expectedGroup = await GroupSchema.findById(testGroup._id)
    await groups.deleteGroup(req, res)
    const updatedGroup = await GroupSchema.findById(expectedGroup._id)
    expect(updatedGroup).toEqual(null)
    const updatedUser = await StudentProfile.findById(testStudent._id)
    expect(updatedUser.groups.length).toEqual(0)
  })
  test('A member can be deleted from a group', async () => {
    const newGroup = new GroupSchema({
      name: testGroupName,
      members: [testStudent._id, extraMember1._id]
    })
    const testGroup = await newGroup.save()

    await StudentProfile.updateOne({ _id: testStudent._id },
      { $push: { groups: testGroup._id } })
    const newTestStudent = await StudentProfile.findOne({})
    expect(newTestStudent.groups.length).toEqual(1)

    const req = {
      body: { name: testGroup.name },
      user: testStudent,
      params: {
        id: testGroup._id,
        member: testStudent._id
      }
    }
    const res = { redirect (url) { return url } }
    await groups.deleteGroupMember(req, res)
    const updatedGroup = await GroupSchema.findById(testGroup._id)
    expect(updatedGroup.members.length).toEqual(1)
    expect(updatedGroup.members[0]).toEqual(extraMember1._id)
    const updatedUser = await StudentProfile.findById(testStudent._id)
    expect(updatedUser.groups.length).toEqual(0)
  })

  test('The last group member removed from a group deletes the group', async () => {
    const newGroup = new GroupSchema({
      name: testGroupName,
      members: testStudent._id
    })
    const testGroup = await newGroup.save()

    const req = {
      body: { name: testGroup.name },
      user: testStudent,
      params: {
        id: testGroup._id
      }
    }
    const res = { redirect (url) { return url } }
    await groups.deleteGroupMember(req, res)
    const updatedGroup = await GroupSchema.findById(testGroup._id)
    expect(updatedGroup).toEqual(null)
    const updatedUser = await StudentProfile.findById(testStudent._id)
    expect(updatedUser.groups.length).toEqual(0)
  })

  test('A member can be added to a group', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: testStudent._id
    })
    const testGroup = await newGroup.save()

    await groups.addGroupMember(testGroup._id, extraMember1._id) // test actual function
    const expectedGroup = await GroupSchema.findById(testGroup._id)
    expect(expectedGroup.members.length).toEqual(2)
    expect(expectedGroup.members[0]).toEqual(testStudent._id)
    expect(expectedGroup.members[1]).toEqual(extraMember1._id)
    done()
  })
  test('A member gets an invite to a group', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: extraMember1._id
    })
    const testGroup = await newGroup.save()

    await groups.invite(testGroup._id, testStudent._id)

    const expectedGroup = await GroupSchema.findOne({})
    const expectedStudent = await StudentProfile.findOne({})
    expect(testStudent._id).toEqual(expectedGroup.invites[0])
    expect(testGroup._id).toEqual(expectedStudent.invites[0])
    done()
  })

  test('A student can be invited to a group', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: extraMember1._id
    })
    const testGroup = await newGroup.save()
    const request = {
      params: { id: testGroup._id, member: testStudent._id },
      user: testStudent
    }
    const response = { redirect (url) { return url } }
    await groups.inviteGroupMember(request, response)

    const expectedGroup = await GroupSchema.findOne({})
    const expectedStudent = await StudentProfile.findOne({})
    expect(testStudent._id).toEqual(expectedGroup.invites[0])
    expect(testGroup._id).toEqual(expectedStudent.invites[0])
    done()
  })

  // TEST SUSPENDED UNTIL FIGURED OUT HOW TO EMULATE SIGNED IN USER
  /* test('A student can view a specific group page', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: [testStudent._id, extraMember1._id]
    })
    const testGroup = await newGroup.save()
    const response = await request.get(`/groups/${testGroup._id}`)
    expect(response.status).toBe(200)
    done()
  }) */

  test('A student can accept an invite to a group', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: extraMember1._id,
      invites: [testStudent._id]
    })
    const testGroup = await newGroup.save()

    await StudentProfile.updateOne({ _id: testStudent._id },
      { $push: { invites: testGroup._id } })
    const newTestStudent = await StudentProfile.findOne({})
    expect(newTestStudent.invites.length).toEqual(1)

    const req = {
      params: { id: testGroup._id },
      user: testStudent._id
    }
    const res = { redirect (url) { return url } }

    await groups.acceptInvite(req, res)

    const updatedGroup = await GroupSchema.findOne({})
    const updatedStudent = await StudentProfile.findOne({})

    expect(updatedGroup.invites.length).toEqual(0)
    expect(updatedStudent.invites.length).toEqual(0)
    expect(updatedGroup.members.length).toEqual(2) // the test user should be in the group twice because they invited themself
    expect(updatedStudent.groups.length).toEqual(1) // the test user should be in the group twice because they invited themself
    done()
  })

  test('A invite is deleted from both the group and the students invite list', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: extraMember1._id,
      invites: [testStudent._id]
    })
    const testGroup = await newGroup.save()

    await StudentProfile.updateOne({ _id: testStudent._id },
      { $push: { invites: testGroup._id } })
    const newTestStudent = await StudentProfile.findOne({})
    expect(newTestStudent.invites.length).toEqual(1)

    await groups.removeInvite(testGroup._id, testStudent._id)

    const updatedGroup = await GroupSchema.findOne({})
    const updatedStudent = await StudentProfile.findOne({})

    expect(updatedGroup.invites.length).toEqual(0)
    expect(updatedStudent.invites.length).toEqual(0)

    done()
  })

  test('A student can decline an invite to a group', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: extraMember1._id,
      invites: [testStudent._id]
    })
    const testGroup = await newGroup.save()

    await StudentProfile.updateOne({ _id: testStudent._id },
      { $push: { invites: testGroup._id } })
    const newTestStudent = await StudentProfile.findOne({})
    expect(newTestStudent.invites.length).toEqual(1)

    const req = {
      params: { id: testGroup._id },
      user: testStudent._id
    }
    const res = { redirect (url) { return url } }

    await groups.declineInvite(req, res)

    const updatedGroup = await GroupSchema.findOne({})
    const updatedStudent = await StudentProfile.findOne({})

    expect(updatedGroup.invites.length).toEqual(0)
    expect(updatedStudent.invites.length).toEqual(0)
    expect(updatedGroup.members.length).toEqual(1) // the test user should be in the group twice because they invited themself
    expect(updatedStudent.groups.length).toEqual(0) // the test user should be in the group twice because they invited themself

    done()
  })
})
