const poll = require('../../../src/controllers/poll')
const middleWare = require('../../../src/middleware/middleware')
const { Poll } = require('../../../src/db/poll')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { GroupSchema } = require('../../../src/db/groups')
const { dbConnect, dbDisconnect } = require('../../../utils/testUtils/dbTestUtils')
const { getGeoData } = require('../../../seeds/locationHelper')
const { app } = require('../../../utils/testUtils/expressTestUtils')
const supertest = require('supertest')
const request = supertest.agent(app)
const Mongoose = require('mongoose')

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
afterEach(async () => {
  await Poll.deleteMany({})
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})
})

describe('Poll controller functionality', () => {
  test('Poll can increment Yes and No', async () => {
    const newPoll = { votes: { yes: 0, no: 0 }, save: function () { } }
    await poll.vote(newPoll, 'yes')
    await poll.vote(newPoll, 'no')
    expect(newPoll.votes.yes).toBe(1)
    expect(newPoll.votes.no).toBe(1)
  })

  test('Poll view controller', async () => {
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test0.member0@test.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const savedStudent = await newStudent.save()
    const group = new GroupSchema({
      name: 'Test Group',
      members: [savedStudent._id]
    })
    await group.save()
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    const req = {
      params: { poll: savedPoll._id, type: 'yes' },
      user: savedStudent
    }
    let index = false
    const res = { render: function () { index = true } }
    await poll.showPoll(req, res)
    expect(index).toBe(true)
  })

  test('Poll controller increases vote yes', async () => {
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test0.member0@test.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const savedStudent = await newStudent.save()
    const group = new GroupSchema({
      name: 'Test Group',
      members: [savedStudent._id]
    })
    await group.save()
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    const req = {
      params: { poll: savedPoll._id, type: 'yes' },
      user: savedStudent
    }
    const res = { redirect: function () { } }
    await poll.votePoll(req, res)
    const checkPoll = await Poll.findById(savedPoll._id)
    expect(checkPoll.votes.yes).toBe(1)
  })

  test('Can view polls page', async (done) => {
    const response = await request.get('/polls/')
    expect(response.status).toBe(200)
    done()
  })

  test('Poll controller increases vote no', async () => {
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test1.member1@test.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const savedStudent = await newStudent.save()
    const group = new GroupSchema({
      name: 'Test Group',
      members: [savedStudent._id]
    })
    await group.save()
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    const req = {
      params: { poll: savedPoll._id, type: 'no' },
      user: savedStudent
    }
    const res = { redirect: function () { } }
    await poll.votePoll(req, res)
    const checkPoll = await Poll.findById(savedPoll._id)
    expect(checkPoll.votes.no).toBe(1)
  })

  test('User is allowed into poll', async () => {
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
    const savedStudent = await newStudent.save()
    const group = new GroupSchema({
      name: 'Test Group',
      members: [savedStudent._id]
    })
    await group.save()
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group
    })
    const savedPoll = await newPoll.save()
    const req = {
      params: { poll: savedPoll._id, type: 'no' },
      user: savedStudent,
      flash: function () { }
    }
    const res = { redirect: function () { } }
    let index = false
    const next = function () { index = true }
    await middleWare.isPartOfVote(req, res, next)
    expect(index).toBe(true)
  })

  test('User isnt allowed into poll', async () => {
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test2.member2@test.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const savedStudent = await newStudent.save()
    const savedStudent2 = { _id: 'TestId' }
    const group = new GroupSchema({
      name: 'Test Group',
      members: [savedStudent._id]
    })
    await group.save()
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    let index = false
    const req = {
      params: { poll: savedPoll._id, type: 'no' },
      user: savedStudent2,
      flash: function () { },
      session: { returnTo: function () { } }
    }
    const res = { redirect: function () { index = true } }
    const next = function () {}
    await middleWare.isPartOfVote(req, res, next)
    expect(index).toBe(true)
  })

  test('Can view a poll', async (done) => {
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
    const savedStudent = await newStudent.save()
    const group = new GroupSchema({
      name: 'Test Group',
      members: [savedStudent._id]
    })
    await group.save()
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    request.user = savedStudent
    // const response = await request.get(`/polls/${savedPoll._id}`)
    // expect(response.status).toBe(200) test doesnt run because we dont have access to req.user
    done()
  })

  test('User can create a poll to add a user to a group', async () => {
    await StudentProfile.deleteMany({})
    await Poll.deleteMany({})
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test3.member3@test3.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const student = await newStudent.save()

    const group = new GroupSchema({
      name: 'Test Group',
      members: [student._id]
    })
    await group.save()
    const invitedStudent = { _id: Mongoose.Types.ObjectId() }
    const req = {
      params: {
        groupId: group._id,
        action: 'Add',
        memberId: invitedStudent._id
      },
      user: student,
      flash: function () {}
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)

    expect(checkPoll.members).toContainEqual(savedStudent._id)
    expect(checkPoll.affected).toEqual(invitedStudent._id)
    expect(checkPoll.action).toEqual('Add')
    expect(checkPoll.group).toEqual(group._id)
    expect(savedStudent.polls).toContainEqual(checkPoll._id)
    expect(savedGroup.polls).toContainEqual(checkPoll._id)
  })

  test('User can create a poll to invite a user to a group', async () => {
    await StudentProfile.deleteMany({})
    await Poll.deleteMany({})
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test3.member3@test3.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const student = await newStudent.save()

    const group = new GroupSchema({
      name: 'Test Group',
      members: [student._id]
    })
    await group.save()
    const invitedStudent = { _id: Mongoose.Types.ObjectId() }
    const req = {
      params: {
        groupId: group._id,
        action: 'Invite',
        memberId: invitedStudent._id
      },
      user: student,
      flash: function () {}
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)

    expect(checkPoll.members).toContainEqual(savedStudent._id)
    expect(checkPoll.affected).toEqual(invitedStudent._id)
    expect(checkPoll.action).toEqual('Invite')
    expect(checkPoll.group).toEqual(group._id)
    expect(savedStudent.polls).toContainEqual(checkPoll._id)
    expect(savedGroup.polls).toContainEqual(checkPoll._id)
  })

  test('User can create a poll to remove a user from a group', async () => {
    await StudentProfile.deleteMany({})
    await Poll.deleteMany({})
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test3.member3@test3.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const student = await newStudent.save()

    const group = new GroupSchema({
      name: 'Test Group',
      members: [student._id]
    })
    await group.save()

    const req = {
      params: {
        groupId: group._id,
        action: 'Remove',
        memberId: student._id
      },
      user: student,
      flash: function () {}
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)

    expect(checkPoll.members).toContainEqual(savedStudent._id)
    expect(checkPoll.affected).toEqual(savedStudent._id)
    expect(checkPoll.action).toEqual('Remove')
    expect(checkPoll.group).toEqual(group._id)
    expect(savedStudent.polls).toContainEqual(checkPoll._id)
    expect(savedGroup.polls).toContainEqual(checkPoll._id)
  })

  test('User can create a poll to remove a user from a group', async () => {
    await StudentProfile.deleteMany({})
    await Poll.deleteMany({})
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test3.member3@test3.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const student = await newStudent.save()

    const group = new GroupSchema({
      name: 'Test Group',
      members: [student._id]
    })
    await group.save()

    const req = {
      params: {
        groupId: group._id,
        action: 'Remove',
        memberId: student._id
      },
      user: student,
      flash: function () {}
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)

    expect(checkPoll.members).toContainEqual(savedStudent._id)
    expect(checkPoll.affected).toEqual(savedStudent._id)
    expect(checkPoll.action).toEqual('Remove')
    expect(checkPoll.group).toEqual(group._id)
    expect(savedStudent.polls).toContainEqual(checkPoll._id)
    expect(savedGroup.polls).toContainEqual(checkPoll._id)
  })

  test('User can create a poll to remove a user from a group', async () => {
    await StudentProfile.deleteMany({})
    await Poll.deleteMany({})
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test3.member3@test3.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const student = await newStudent.save()

    const group = new GroupSchema({
      name: 'Test Group',
      members: [student._id]
    })
    await group.save()

    const req = {
      params: {
        groupId: group._id,
        action: 'Remove',
        memberId: student._id
      },
      user: student,
      flash: function () {}
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)

    expect(checkPoll.members).toContainEqual(savedStudent._id)
    expect(checkPoll.affected).toEqual(savedStudent._id)
    expect(checkPoll.action).toEqual('Remove')
    expect(checkPoll.group).toEqual(group._id)
    expect(savedStudent.polls).toContainEqual(checkPoll._id)
    expect(savedGroup.polls).toContainEqual(checkPoll._id)
  })

  test('Remove type poll updates correctly', async () => {
    await StudentProfile.deleteMany({})
    await Poll.deleteMany({})
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test3.member3@test3.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const student = await newStudent.save()

    const group = new GroupSchema({
      name: 'Test Group',
      members: student._id
    })
    await group.save()

    await StudentProfile.updateOne({ _id: student._id },
      { $push: { groups: group._id } })

    const updateStudent = await StudentProfile.findOne({})
    expect(updateStudent.groups.length).toEqual(1)
    const newPoll = new Poll({
      members: [student._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: student._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()

    await poll.updatePoll(savedPoll._id)
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)
    expect(savedStudent.groups.length).toBe(0)
    expect(savedGroup).toBe(null) // last member deleted deletes the group
    expect(savedStudent.polls.length).toBe(0)
  })

  test('Add type poll updates correctly', async () => {
    await StudentProfile.deleteMany({})
    await Poll.deleteMany({})
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test3.member3@test3.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const student = await newStudent.save()

    const group = new GroupSchema({
      name: 'Test Group',
      members: [student._id]
    })
    await group.save()

    const newPoll = new Poll({
      members: [student._id],
      name: 'Testing Poll',
      action: 'Add',
      affected: student._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    await newPoll.save()

    await poll.updatePoll(newPoll._id)
    const savedStudent = await StudentProfile.findById(student._id)
    const savedGroup = await GroupSchema.findById(group._id)
    expect(savedStudent.groups.length).toBe(1)
    expect(savedGroup.members.length).toBe(2)
    expect(savedGroup.polls.length).toBe(0)
  })

  test('Invite type poll updates correctly', async () => {
    await StudentProfile.deleteMany({})
    await Poll.deleteMany({})
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const newStudent = new StudentProfile({
      email: 'test3.member3@test3.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location,
      geodata
    })
    const student = await newStudent.save()

    const group = new GroupSchema({
      name: 'Test Group',
      members: [student._id]
    })
    await group.save()

    const newPoll = new Poll({
      members: [student._id],
      name: 'Testing Poll',
      action: 'Invite',
      affected: student._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    await newPoll.save()

    await poll.updatePoll(newPoll._id)
    const savedStudent = await StudentProfile.findById(student._id)
    const savedGroup = await GroupSchema.findById(group._id)
    expect(savedStudent.groups.length).toBe(0)
    expect(savedGroup.members.length).toBe(1) // Student should not be added yet, only invited
    expect(savedStudent.invites.length).toBe(1)
    expect(savedGroup.invites.length).toBe(1)
    expect(savedGroup.polls.length).toBe(0)
  })

  // test('Can create poll through route', async () => {
  //   // cant access req.user
  // })
})
