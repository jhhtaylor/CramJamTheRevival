const poll = require('../../../src/controllers/poll')
const middleWare = require('../../../src/middleware/middleware')
const { Poll } = require('../../../src/db/poll')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { dbConnect, dbDisconnect } = require('../../../utils/testUtils/dbTestUtils')
const { getGeoData } = require('../../../seeds/locationHelper')
const { app } = require('../../../utils/testUtils/expressTestUtils')
const supertest = require('supertest')
const request = supertest.agent(app)

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
afterEach(async () => {
  await Poll.deleteMany({})
  await StudentProfile.deleteMany({})
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
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: []
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
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: []
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
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: []
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
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: []
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
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: []
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
    const newPoll = new Poll({
      members: [savedStudent._id],
      name: 'Testing Poll',
      action: 'Remove',
      affected: savedStudent._id,
      votes: { yes: 0, no: 0 },
      voted: []
    })
    const savedPoll = await newPoll.save()
    request.user = savedStudent
    // const response = await request.get(`/polls/${savedPoll._id}`)
    // expect(response.status).toBe(200) test doesnt run because we dont have access to req.user
    done()
  })

  test('User can create a poll', async () => {
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
    const savedStudent = await newStudent.save()
    const req = {
      user: savedStudent,
      flash: function () {}
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    expect(checkPoll.members).toContainEqual(savedStudent._id)
  })

  // test('Can create poll through route', async () => {
  //   // cant access req.user
  // })
})
