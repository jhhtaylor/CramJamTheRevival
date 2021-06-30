const { getGeoData } = require('../../../seeds/locationHelper')
const meetings = require('../../../src/controllers/meetings')
const groups = require('../../../src/controllers/groups')
const { GroupSchema } = require('../../../src/db/groups')
const { MeetingSchema } = require('../../../src/db/meetings')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { CovidSurvey } = require('../../../src/db/covidSurvey')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const { app } = require('../../../utils/testUtils/expressTestUtils')
const mongoose = require('mongoose')

const supertest = require('supertest')
const request = supertest.agent(app)
const Mongoose = require('mongoose')
const { check } = require('express-validator')
const { contains } = require('cheerio/lib/static')

let testStudent
let testGroup
let testSurvey
let extraMember1
let extraMemberId1
let testDate
let testStart
let testEnd
let start
let end
let testAddress
let testMeeting
beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
beforeEach(async () => {
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})
  await CovidSurvey.deleteMany({})
  await MeetingSchema.deleteMany({})

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

  testGroup = new GroupSchema({
    name: 'Test Test',
    members: [testStudent._id],
    invites: []
  })
  await testGroup.save()
  testMeetingName = 'Test Meeting'

  testAddress = '43 Dundalk Avenue parkview johannesburg'
  testDate = '2100-06-24'
  testStart = '12:23'
  testEnd = '14:46'
  now = new Date()
  start = new Date(2100, 5, 24, 12, 23, 0, 0) // month is 0 indexed
  end = new Date(2100, 5, 24, 14, 46, 0, 0) // month is 0 indexed

  testSurvey = new CovidSurvey({
    student: testStudent._id,
    symptoms: {
      fever: false,
      dryCough: false,
      soreThroat: false,
      redEyes: false,
      shortBreath: false,
      bodyAches: false,
      lossSmell: false,
      nausea: false,
      diarrhea: false,
      fatigue: false
    },
    exposure: {
      test: false,
      exposed: false
    },
    testDate: new Date()
  })
  await testSurvey.save()
})

// will change once there is access to database
describe('Meeting controller functionality', () => {
  test('A user cannot view meetings page if not logged in', async (done) => {
    const response = await request.get('/meetings')
    expect(response.status).toBe(302) // redirect since user is not logged in
    done()
  })

  test('An inperson meeting can be added to the database', async (done) => {
    const req = {
      params: { groupid: testGroup._id },
      body: {
        name: testMeetingName,
        address: testAddress,
        date: testDate,
        startTime: testStart,
        endTime: testEnd
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }
    await meetings.createMeeting(req, res)
    const expectedMeeting = await MeetingSchema.findOne({})
    expect(expectedMeeting.name).toEqual(testMeetingName)
    expect(expectedMeeting.location.type).toEqual('Point')
    expect(expectedMeeting.location.coordinates[0]).toEqual(28.028742)
    expect(expectedMeeting.location.coordinates[1]).toEqual(-26.162452)
    expect(expectedMeeting.start).toEqual(start)
    expect(expectedMeeting.end).toEqual(end)
    await MeetingSchema.findByIdAndDelete(expectedMeeting._id)
    done()
  })

  test('An online meeting can be added to the database', async (done) => {
    const req = {
      params: { groupid: testGroup._id },
      body: {
        name: testMeetingName,
        address: '',
        date: testDate,
        startTime: testStart,
        endTime: testEnd
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }
    await meetings.createMeeting(req, res)
    const expectedMeeting = await MeetingSchema.findOne({})
    expect(expectedMeeting.name).toEqual(testMeetingName)
    expect(expectedMeeting.location.type).toEqual('Online')
    expect(expectedMeeting.location.coordinates.length).toEqual(0)
    expect(expectedMeeting.start).toEqual(start)
    expect(expectedMeeting.end).toEqual(end)
    await MeetingSchema.findByIdAndDelete(expectedMeeting._id)
    done()
  })

  test('An invalid group id cannot be used to create a meeting', async (done) => {
    const req = {
      params: { groupid: mongoose.Types.ObjectId() },
      body: {
        name: testMeetingName,
        address: testAddress,
        date: testDate,
        startTime: testStart,
        endTime: testEnd
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }
    const url = await meetings.createMeeting(req, res)
    const expectedMeeting = await MeetingSchema.findOne({})
    expect(expectedMeeting).toEqual(null)
    expect(url).toEqual('/')
    done()
  })

  test('An end time cannot be before a start time when creating a meeting', async (done) => {
    const req = {
      params: { groupid: testGroup._id },
      body: {
        name: testMeetingName,
        address: testAddress,
        date: testDate,
        startTime: testEnd,
        endTime: testStart
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }
    const url = await meetings.createMeeting(req, res)
    const expectedMeeting = await MeetingSchema.findOne({})
    expect(expectedMeeting).toEqual(null)
    expect(url).toEqual(`/meetings/new/${testGroup._id}`)
    done()
  })

  test('A non existant address cannot be used to create a meeting', async (done) => {
    const req = {
      params: { groupid: testGroup._id },
      body: {
        name: testMeetingName,
        address: '231231asdasd123123',
        date: testDate,
        startTime: testStart,
        endTime: testEnd
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }
    const url = await meetings.createMeeting(req, res)
    const expectedMeeting = await MeetingSchema.findOne({})
    expect(expectedMeeting).toEqual(null)
    expect(url).toEqual(`/meetings/new/${testGroup._id}`)
    done()
  })

  // TODO make tests for Josh's location finder

  test('should check covid status', async (done) => {
    const { lastSurvey, covidSafe, covidMessage } = await meetings.covidCheck(testStudent._id)
    expect(covidSafe).toBe(true)
    done()
  })

  test('should check allowed users', async (done) => {
    const allowedUsers = await meetings.listAllowedToAttend([testStudent._id])
    expect(allowedUsers.includes(testStudent._id)).toBe(true)
    done()
  })

  test('should show show page', async (done) => {
    const req = {
      params: { groupid: testGroup._id },
      body: {
        name: 'Testing a meeting',
        address: testAddress,
        date: testDate,
        startTime: testStart,
        endTime: testEnd
      },
      user: testStudent,
      flash: function () { }
    }
    const res = { redirect (url) { return url } }
    await meetings.createMeeting(req, res)
    testMeeting = await MeetingSchema.findOne({})
    req.params.meetingid = testMeeting._id
    let checkUrl
    res.render = function (url, obj) { checkUrl = url }
    await meetings.show(req, res)
    expect(checkUrl).toBe('meetings/show')
    done()
  })

  test('should add to meeting', async (done) => {
    let checkUrl
    const req = {
      params: { groupid: testGroup._id },
      body: {
        name: 'Testing a meeting',
        address: testAddress,
        date: testDate,
        startTime: testStart,
        endTime: testEnd
      },
      user: testStudent,
      flash: function () { },
      redirect: function (url) { checkUrl = url }
    }
    const res = { redirect (url) { return url } }
    await meetings.createMeeting(req, res)
    testMeeting = await MeetingSchema.findOne({})
    req.params.meetingid = testMeeting._id
    const id = Mongoose.Types.ObjectId()
    req.user = { _id: id }
    await meetings.addToMeeting(req, res)
    const checkMeeting = await MeetingSchema.findById(testMeeting._id)
    expect(checkMeeting.attendees.includes(id))
    done()
  })
})
