const groups = require('../../../src/controllers/groups')
const { GroupSchema } = require('../../../src/db/groups')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { Tag } = require('../../../src/db/tags')
const { Poll } = require('../../../src/db/poll')
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
  await Tag.deleteMany({})
  await Poll.deleteMany({})
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

  test('A group can be added to the database', async () => {
    const req = {
      body: { name: testGroupName },
      user: testStudent,
      flash: function () { }
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

    const expectedGroup = await GroupSchema.findById(testGroup._id)
    await groups.deleteGroup(testGroup._id)
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
        member: testStudent._id,
        flash: function () { }
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
        id: testGroup._id,
        flash: function () { }
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
      members: extraMember1._id
    })
    const testGroup = await newGroup.save()

    await groups.addGroupMember(testGroup._id, testStudent._id) // test actual function
    const expectedGroup = await GroupSchema.findById(testGroup._id)
    expect(expectedGroup.members.length).toEqual(2)
    expect(expectedGroup.members[0]).toEqual(extraMember1._id)
    expect(expectedGroup.members[1]).toEqual(testStudent._id)
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
      user: testStudent,
      flash: function () { }
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
      user: testStudent._id,
      flash: function () { }
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
      user: testStudent._id,
      flash: function () { }
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
  test('A student who is already part of 10 groups cannot be added to a new group', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: []
    })
    const testGroup = await newGroup.save()
    for (let i = 0; i < 10; i++) {
      testStudent.groups.push(Mongoose.Types.ObjectId())
      await testStudent.save()
    }
    expect(testStudent.groups.length).toBe(10)
    let error
    try {
      await groups.addGroupMember(testGroup._id, testStudent._id)
    } catch (e) {
      error = e
    }
    const group = await GroupSchema.findOne({})
    const student = await StudentProfile.findOne({})
    expect(error.message).toBe('StudentProfile validation failed: groups: Group limit reached!')
    expect(student.groups.length).toBe(10)
    expect(group.members.length).toBe(0)

    done()
  })
  test('A student cannot create a new group if they are already part of 10 groups', async (done) => {
    for (let i = 0; i < 10; i++) {
      testStudent.groups.push(Mongoose.Types.ObjectId())
      await testStudent.save()
    }
    expect(testStudent.groups.length).toBe(10)
    const req = {
      body: { name: 'testGroup' },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }

    await groups.createGroup(req, res)

    const group = await GroupSchema.findOne({})
    const student = await StudentProfile.findOne({})
    expect(student.groups.length).toBe(10)
    expect(group).toBe(null) // group should not be created

    done()
  })

  test('A student cannot accept an invite if they are already part of 10 groups', async (done) => {
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      members: [],
      invites: [testStudent._id]
    })
    const testGroup = await newGroup.save()

    // Fill student's groups
    for (let i = 0; i < 10; i++) {
      testStudent.groups.push(Mongoose.Types.ObjectId())
      await testStudent.save()
    }
    testStudent.invites.push(Mongoose.Types.ObjectId())
    await testStudent.save()

    const req = {
      body: { name: 'testGroup' },
      user: testStudent,
      params: {
        id: Mongoose.Types.ObjectId()
      },
      flash: function () { }
    }
    const res = { redirect (url) { return url } }

    await groups.acceptInvite(req, res)

    const group = await GroupSchema.findOne({})
    const student = await StudentProfile.findOne({})
    expect(student.groups.length).toBe(10)
    expect(group.members.length).toBe(0) // group should not be created
    expect(student.invites.length).toBe(1)
    expect(group.invites.length).toBe(1)

    done()
  })

  test('A student can a new tags to a group', async (done) => {
    const tagsInput = 'tag-one'
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      tags: []
    })
    const testGroup = await newGroup.save()

    const req = {
      body: {
        group: testGroup._id,
        tags: tagsInput
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }

    await groups.editTags(req, res)

    const group = await GroupSchema.findOne({})
    const tags = await Tag.find({})
    expect(group.tags.length).toBe(1)
    expect(tags.length).toBe(1)
    expect(tags[0].name).toBe('tag-one')
    expect(tags[0].groups[0]).toStrictEqual(group._id)

    done()
  })

  test('A student can add an existing tag to a group', async (done) => {
    const inputTag = 'tag-one'
    const tag = new Tag({
      name: inputTag
    })
    await tag.save()
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      tags: []
    })
    const testGroup = await newGroup.save()

    const req = {
      body: {
        group: testGroup._id,
        tags: inputTag
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }

    await groups.editTags(req, res)

    const group = await GroupSchema.findOne({})
    const tags = await Tag.find({})
    expect(group.tags.length).toBe(1)
    expect(tags.length).toBe(1) // a new tag should not be created
    expect(tags[0].name).toBe('tag-one')
    expect(tags[0].groups[0]).toStrictEqual(group._id)

    done()
  })

  test('A student cannot add an existing tag to a group that already has that tag', async (done) => {
    const inputTag = 'tag-one'
    const tag = new Tag({
      name: inputTag
    })
    await tag.save()
    const newGroup = new GroupSchema({
      name: 'New Test Group',
      tags: [tag._id]
    })
    const testGroup = await newGroup.save()
    tag.groups.push(testGroup._id)
    await tag.save()
    const req = {
      body: {
        group: testGroup._id,
        tags: inputTag
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }

    await groups.editTags(req, res)

    const group = await GroupSchema.findOne({})
    const tags = await Tag.find({})
    expect(group.tags.length).toBe(1)
    expect(tags.length).toBe(1) // a new tag should not be created
    expect(tags[0].name).toBe('tag-one')
    expect(tags[0].groups[0]).toStrictEqual(group._id)

    done()
  })

  test('If a student is removed from a group, they should be removed from all the group polls', async (done) => {
    const extraMembers = [Mongoose.Types.ObjectId(), Mongoose.Types.ObjectId(), Mongoose.Types.ObjectId()]
    const newGroup = new GroupSchema({
      name: testGroupName,
      members: [testStudent._id, extraMembers[0], extraMembers[1], extraMembers[2]]
    })
    const testGroup = await newGroup.save()
    const poll = new Poll({
      members: [testStudent._id, extraMembers[0], extraMembers[1]],
      name: 'Testing Poll',
      pollster: extraMembers[0],
      action: 'Invite',
      affected: extraMembers[2],
      votes: { yes: 1, no: 0 },
      voted: [],
      group: testGroup._id
    })
    await poll.save()
    testGroup.polls.push(poll._id)
    await testGroup.save()
    testStudent.polls.push(poll._id)
    await testStudent.save()

    const req = {
      user: extraMembers[2],
      params: {
        id: testGroup._id,
        member: testStudent._id,
        flash: function () { }
      }
    }
    const res = { redirect (url) { return url } }
    await groups.deleteGroupMember(req, res)
    const updatedGroup = await GroupSchema.findById(testGroup._id)
    const updatedStudent = await StudentProfile.findOne({})
    const updatedPoll = await Poll.findOne({})

    expect(updatedGroup.members.length).toEqual(3)
    expect(updatedGroup.polls.length).toEqual(1)
    expect(updatedStudent.groups.length).toEqual(0)
    expect(updatedStudent.polls.length).toBe(0)
    expect(updatedPoll.members.length).toBe(2)
    done()
  })
  test('If a student is removed from a group, their polls should be deleted', async (done) => {
    const extraMembers = [Mongoose.Types.ObjectId(), Mongoose.Types.ObjectId(), Mongoose.Types.ObjectId()]
    const newGroup = new GroupSchema({
      name: testGroupName,
      members: [testStudent._id, extraMembers[0], extraMembers[1], extraMembers[2]],
      polls: []
    })
    const testGroup = await newGroup.save()
    const poll = new Poll({
      members: [testStudent._id, extraMembers[0], extraMembers[1]],
      name: 'Testing Poll',
      pollster: testStudent._id,
      action: 'Invite',
      affected: extraMembers[2],
      votes: { yes: 1, no: 0 },
      voted: [],
      group: testGroup._id
    })
    await poll.save()
    testGroup.polls.push(poll._id)
    await testGroup.save()
    testStudent.polls.push(poll._id)
    testStudent.username = 'mokey'
    await testStudent.save()

    const req = {
      user: extraMembers[2],
      params: {
        id: testGroup._id,
        member: testStudent._id,
        flash: function () { }
      }
    }
    const res = { redirect (url) { return url } }
    await groups.deleteGroupMember(req, res)
    const updatedGroup = await GroupSchema.findById(testGroup._id)
    const updatedStudent = await StudentProfile.findOne({})
    const updatedPoll = await Poll.findOne({})

    expect(updatedGroup.members.length).toEqual(3)
    expect(updatedStudent.groups.length).toEqual(0)
    expect(updatedStudent.polls.length).toBe(0)
    expect(updatedPoll.active).toBe(false)
    done()
  })
})
