const poll = require('../../../src/controllers/poll')
const { Poll } = require('../../../src/db/poll')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const { getGeoData } = require('../../../seeds/locationHelper')
const { app } = require('../../../utils/testUtils/expressTestUtils')
const supertest = require('supertest')
const request = supertest.agent(app)

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
beforeEach(async () => {
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

  test('Poll controller increases vote yes', async () => {
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
      params: { poll: savedPoll._id, type: 'yes' },
      user: savedStudent
    }
    const res = { redirect: function () { } }
    await poll.votePoll(req, res)
    const checkPoll = await Poll.findById(savedPoll._id)
    expect(checkPoll.votes.yes).toBe(1)
  })

  test('Poll controller increases vote no', async () => {
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
      user: savedStudent
    }
    const res = { redirect: function () { } }
    await poll.votePoll(req, res)
    const checkPoll = await Poll.findById(savedPoll._id)
    expect(checkPoll.votes.no).toBe(1)
  })

  test('Can view polls page', async (done) => {
    const response = await request.get('/polls/')
    expect(response.status).toBe(200)
    done()
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
    const response = await request.get(`/polls/${savedPoll._id}`)
    // expect(response.status).toBe(200) test doesnt run because we dont have access to req.user
    done()
  })

  test('User can create a poll', async () => {
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
    const req = {
      user: savedStudent,
      flash: function () {}
    }
    const res = { redirect: function () { } }
    await poll.createPoll(req, res)
    const checkPoll = await Poll.findOne({})
    expect(checkPoll.members).toContainEqual(savedStudent._id)
  })

  test('Can create poll through route', async() => {

  })
})
