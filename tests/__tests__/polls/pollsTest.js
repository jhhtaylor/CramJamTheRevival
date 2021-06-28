const poll = require('../../../src/controllers/poll')
const httpMocks = require('node-mocks-http')
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
// const { before } = require('cheerio/lib/api/manipulation')

let student
let group
let extraMember1

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })

beforeEach(async () => {
  await Poll.deleteMany({})
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})

  const data = getGeoData()
  const location = data.location
  const geodata = data.geodata
  student = new StudentProfile({
    email: 'test.member@test.com',
    firstName: 'Member',
    lastName: 'Test',
    password: '',
    groups: [],
    location,
    geodata
  })
  await student.save()
  group = new GroupSchema({
    name: 'Test Group',
    members: [student._id]
  })
  await group.save()
  extraMember1 = { _id: Mongoose.Types.ObjectId() }
})

describe('Poll controller functionality', () => {
  test('Poll can increment Yes and No', async () => {
    const newPoll = { votes: { yes: 0, no: 0 }, pollster: student._id, save: function () { } }
    await poll.vote(newPoll, 'yes')
    await poll.vote(newPoll, 'no')
    expect(newPoll.votes.yes).toBe(1)
    expect(newPoll.votes.no).toBe(1)
  })

  test('Poll view controller', async () => {
    const newPoll = new Poll({
      members: [student._id],
      name: 'Testing Poll',
      pollster: student._id,
      action: 'Remove',
      affected: student._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    const req = {
      params: { poll: savedPoll._id, type: 'yes' },
      user: student

    }
    let index = false
    const res = { render: function () { index = true } }
    await poll.showPoll(req, res)
    expect(index).toBe(true)
  })

  test('Poll controller increases vote yes', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      name: 'Testing Poll',
      pollster: extraMember1._id,
      action: 'Remove',
      affected: student._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    const req = {
      params: { poll: savedPoll._id, type: 'yes' },
      user: student,
      flash: function () { }
    }
    const res = { redirect: function () { } }
    await poll.votePoll(req, res)
    const checkPoll = await Poll.findById(savedPoll._id)
    expect(checkPoll.votes.yes).toBe(1)
  })

  test('Poll controller increases vote no', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      name: 'Testing Poll',
      pollster: extraMember1._id,
      action: 'Remove',
      affected: student._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    const req = {
      params: { poll: savedPoll._id, type: 'no' },
      user: student,
      flash: function () { }
    }
    const res = { redirect: function () { } }
    await poll.votePoll(req, res)
    const checkPoll = await Poll.findById(savedPoll._id)
    expect(checkPoll.votes.no).toBe(1)
  })

  test('User is allowed into poll', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      name: 'Testing Poll',
      pollster: extraMember1._id,
      action: 'Remove',
      affected: student._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group
    })
    const savedPoll = await newPoll.save()
    const req = {
      params: { poll: savedPoll._id, type: 'no' },
      user: student,
      flash: function () { }
    }
    const res = { redirect: function () { } }
    let index = false
    const next = function () { index = true }
    await middleWare.isPartOfVote(req, res, next)
    expect(index).toBe(true)
  })

  test('User isnt allowed into poll', async () => {
    const savedStudent2 = { _id: 'TestId' }

    const newPoll = new Poll({
      members: [student._id],
      name: 'Testing Poll',
      pollster: extraMember1._id,
      action: 'Remove',
      affected: student._id,
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
    const newPoll = new Poll({
      members: [student._id],
      name: 'Testing Poll',
      pollster: extraMember1._id,
      action: 'Remove',
      affected: student._id,
      votes: { yes: 0, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()
    request.user = student
    // const response = await request.get(`/polls/${savedPoll._id}`)
    // expect(response.status).toBe(200) test doesnt run because we dont have access to req.user
    done()
  })

  test('User can create a poll request to join a group', async () => {
    const addStudent = { _id: Mongoose.Types.ObjectId(), username: 'Test' }
    const req = {
      params: {
        groupId: group._id,
        action: 'Add',
        memberId: addStudent._id
      },
      user: addStudent,
      flash: function () {},
      body: {
        reason: 'Disrespectful behaviour'
      }
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)

    expect(checkPoll.members).toContainEqual(savedStudent._id)
    expect(checkPoll.affected).toEqual(addStudent._id)
    expect(checkPoll.action).toEqual('Add')
    expect(checkPoll.reason).toEqual('Disrespectful behaviour')
    expect(checkPoll.group).toEqual(group._id)
    expect(savedStudent.polls).toContainEqual(checkPoll._id)
    expect(savedGroup.polls).toContainEqual(checkPoll._id)
  })

  test('User cannot create poll to remove themself from a group', async () => {
    const request = httpMocks.createRequest({
      params: {
        groupId: group._id,
        action: 'Remove',
        memberId: student._id
      },
      user: student,
      flash: function () {}
    })
    const response = httpMocks.createResponse()
    await poll.createPoll(request, response)
    const checkPoll = await Poll.findOne({})
    expect(checkPoll).toEqual(null)
  })

  test('User cannot create poll to invite themself to a group', async () => {
    const request = httpMocks.createRequest({
      params: {
        groupId: group._id,
        action: 'Invite',
        memberId: student._id
      },
      user: student,
      flash: function () {}
    })
    const response = httpMocks.createResponse()
    await poll.createPoll(request, response)
    const checkPoll = await Poll.findOne({})
    expect(checkPoll).toEqual(null)
  })

  test('User can create a poll to invite a user to a group', async () => {
    const invitedStudent = { _id: Mongoose.Types.ObjectId() }
    const req = {
      params: {
        groupId: group._id,
        action: 'Invite',
        memberId: invitedStudent._id
      },
      user: student,
      flash: function () {},
      body: {
        reason: 'Disrespectful behaviour'
      }
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
    const otherStudent = { _id: Mongoose.Types.ObjectId() }
    const group = new GroupSchema({
      name: 'Test Group',
      members: [student._id, otherStudent._id]
    })
    await group.save()

    const req = {
      params: {
        groupId: group._id,
        action: 'Remove',
        memberId: otherStudent._id
      },
      user: student,
      flash: function () {},
      body: {
        reason: 'Disrespectful behaviour'
      }
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)

    expect(checkPoll.members).toContainEqual(savedStudent._id)
    expect(checkPoll.affected).toEqual(otherStudent._id)
    expect(checkPoll.action).toEqual('Remove')
    expect(checkPoll.group).toEqual(group._id)
    expect(savedStudent.polls).toContainEqual(checkPoll._id)
    expect(savedGroup.polls).toContainEqual(checkPoll._id)
  })

  test('User cannot create a poll to invite themself to a group', async () => {
    const otherStudent = { _id: Mongoose.Types.ObjectId() }

    const req = {
      params: {
        groupId: group._id,
        action: 'Invite',
        memberId: otherStudent._id
      },
      user: otherStudent,
      flash: function () {},
      body: {
        reason: 'Disrespectful behaviour'
      }
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})

    expect(checkPoll).toBe(null)
  })

  test('User cannot create a poll that already exists', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      name: 'Testing Poll',
      pollster: extraMember1._id,
      action: 'Add',
      affected: student._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    await newPoll.save()

    const req = {
      params: {
        groupId: group._id,
        action: 'Add',
        memberId: student._id
      },
      user: student,
      flash: function () {},
      body: {
        reason: 'Disrespectful behaviour'
      }
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.find({})

    expect(checkPoll.length).toEqual(1)
  })

  test('Remove type poll updates correctly', async () => {
    await StudentProfile.updateOne({ _id: student._id },
      { $push: { groups: group._id } })

    const updateStudent = await StudentProfile.findOne({})
    expect(updateStudent.groups.length).toEqual(1)
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      name: 'Testing Poll',
      action: 'Remove',
      pollster: extraMember1._id,
      affected: student._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    const savedPoll = await newPoll.save()

    const req = {
      flash: function () {}
    }

    await poll.updatePoll(savedPoll._id, req)
    const savedStudent = await StudentProfile.findOne({})
    const savedGroup = await GroupSchema.findById(group._id)
    expect(savedStudent.groups.length).toBe(0)
    expect(savedGroup).toBe(null) // last member deleted deletes the group
    expect(savedStudent.polls.length).toBe(0)
  })

  test('Add type poll updates correctly', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      name: 'Testing Poll',
      action: 'Add',
      pollster: extraMember1._id,
      affected: student._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    await newPoll.save()

    const req = {
      flash: function () {}
    }
    await poll.updatePoll(newPoll._id, req)
    const savedStudent = await StudentProfile.findById(student._id)
    const savedGroup = await GroupSchema.findById(group._id)
    expect(savedStudent.groups.length).toBe(1)
    expect(savedGroup.members.length).toBe(2)
    expect(savedGroup.polls.length).toBe(0)
  })

  test('Invite type poll updates correctly', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      pollster: extraMember1._id,
      name: 'Testing Poll',
      action: 'Invite',
      affected: student._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    await newPoll.save()

    const req = {
      flash: function () {}
    }

    await poll.updatePoll(newPoll._id, req)
    const savedStudent = await StudentProfile.findById(student._id)
    const savedGroup = await GroupSchema.findById(group._id)
    expect(savedStudent.groups.length).toBe(0)
    expect(savedGroup.members.length).toBe(1) // Student should not be added yet, only invited
    expect(savedStudent.invites.length).toBe(1)
    expect(savedGroup.invites.length).toBe(1)
    expect(savedGroup.polls.length).toBe(0)
  })

  test('Reset poll correctly', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      pollster: student._id,
      name: 'Testing Poll',
      action: 'Invite',
      affected: extraMember1._id,
      votes: { yes: 1, no: 0 },
      voted: [student._id],
      group: group._id
    })
    await newPoll.save()

    const req = {
      params: {
        pollId: newPoll._id
      },
      user: student,
      flash: function () {}
    }
    const res = { redirect: function () { } }

    await poll.resetPoll(req, res)
    const savedStudent = await StudentProfile.findById(student._id)
    const savedPoll = await Poll.findById(newPoll._id)
    expect(savedStudent.polls.length).toBe(1)
    expect(savedPoll.members.length).toBe(2)
    expect(savedPoll.voted.length).toBe(0)
    expect(savedPoll.votes.yes).toBe(0)
    expect(savedPoll.votes.no).toBe(0)
  })

  test('Only pollster may reset the poll', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      pollster: student._id,
      name: 'Testing Poll',
      action: 'Invite',
      affected: extraMember1._id,
      votes: { yes: 1, no: 0 },
      voted: [student._id],
      group: group._id
    })
    await newPoll.save()
    const req = {
      params: {
        pollId: newPoll._id
      },
      user: extraMember1._id,
      flash: function () {}
    }
    const res = { redirect: function () { } }

    await poll.resetPoll(req, res)
    const savedStudent = await StudentProfile.findById(student._id)
    const savedPoll = await Poll.findById(newPoll._id)
    expect(savedStudent.polls.length).toBe(0)
    expect(savedPoll.members.length).toBe(2)
    expect(savedPoll.voted.length).toBe(1)
    expect(savedPoll.votes.yes).toBe(1)
    expect(savedPoll.votes.no).toBe(0)
  })

  test('Close poll correctly', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      name: 'Testing Poll',
      pollster: extraMember1._id,
      action: 'Invite',
      affected: student._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    await newPoll.save()
    student.polls.push(newPoll._id)
    await student.save()
    const req = {
      params: {
        pollId: newPoll._id
      },
      user: extraMember1,
      flash: function () {}
    }
    const res = { redirect: function () { } }
    await poll.closePoll(req, res)
    const savedStudent = await StudentProfile.findById(student._id)
    const savedPolls = await Poll.find({})
    expect(savedStudent.polls.length).toBe(0)
    expect(savedPolls.length).toBe(0)
  })
  test('Only pollster may close a poll', async () => {
    const newPoll = new Poll({
      members: [student._id, extraMember1._id],
      name: 'Testing Poll',
      pollster: student._id,
      action: 'Invite',
      affected: extraMember1._id,
      votes: { yes: 1, no: 0 },
      voted: [],
      group: group._id
    })
    await newPoll.save()
    student.polls.push(newPoll._id)
    await student.save()
    const req = {
      params: {
        pollId: newPoll._id
      },
      user: extraMember1,
      flash: function () {}
    }
    const res = { redirect: function () { } }

    await poll.closePoll(req, res)
    const savedStudent = await StudentProfile.findById(student._id)
    const savedPolls = await Poll.find({})
    expect(savedStudent.polls.length).toBe(1)
    expect(savedPolls.length).toBe(1)
  })

  // test('Can create poll through route', async () => {
  //   // cant access req.user
  // })
})
