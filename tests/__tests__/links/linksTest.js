const groups = require('../../../src/controllers/groups')
const links = require('../../../src/controllers/links')
const { GroupSchema } = require('../../../src/db/groups')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { LinkSchema } = require('../../../src/db/links')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const { getGeoData } = require('../../../seeds/locationHelper')
const { app } = require('../../../utils/testUtils/expressTestUtils')
const supertest = require('supertest')
const request = supertest.agent(app)

let testStudent
let testGroupName

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
beforeEach(async () => {
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})
  await LinkSchema.deleteMany({})

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

  testGroupName = 'Test Group'
})

describe('Link controller functionality', () => {
  test('A user cannot view the links page if not logged in', async (done) => {
    const response = await request.get('/links')
    expect(response.status).toBe(302) // redirect since user is not logged in
    done()
  })

  test('A link can be added to the database', async () => {
    const newGroup = new GroupSchema({
      name: testGroupName,
      members: testStudent._id
    })
    const testGroup = await newGroup.save()

    const testLinkName = 'New Test Link'
    const testLinkNote = 'New Test Note'
    const testLinkUrl = 'https://www.google.com/'

    const newLink = new LinkSchema({
      name: testLinkName,
      note: testLinkNote,
      url: testLinkUrl,
      user: testStudent,
      group: testGroup
    })
    const testLink = await newLink.save()

    const expectedLink = await LinkSchema.findOne({})

    expect(expectedLink.name).toEqual(testLinkName)
    expect(expectedLink.note).toEqual(testLinkNote)
    expect(expectedLink.url).toEqual(testLinkUrl)
    expect(expectedLink.user._id).toEqual(testStudent._id)
    expect(expectedLink.group._id).toEqual(testGroup._id)
  })

  test('A user can add a link', async () => {
    const testName = 'New Test Link'
    const testNote = 'New Test Note'
    const testUrl = 'https://www.google.com/'
    const newGroup = new GroupSchema({
      name: testGroupName,
      members: testStudent._id
    })
    const testGroup = await newGroup.save()
    const req = {
      body: {
        name: testName,
        note: testNote,
        url: testUrl,
        selectedGroup: testGroup._id
      },
      user: testStudent,
      flash: function () { }
    }

    const res = { redirect(url) { return url } }
    await links.createLink(req, res)
    const expectedLink = await LinkSchema.findOne({})
    expect(expectedLink.name).toEqual(testName)
    expect(expectedLink.note).toEqual(testNote)
    expect(expectedLink.url).toEqual(testUrl)
    expect(expectedLink.user._id).toEqual(testStudent._id)
    expect(expectedLink.group._id).toEqual(testGroup._id)
  })

  test('URLs are checked for validity', async () => {
    const testValidUrl = 'https://www.google.com/'
    const testInvalidUrl = 'fake'
    expect(links.isValidHttpUrl(testValidUrl)).toBe(true)
    expect(links.isValidHttpUrl(testInvalidUrl)).toBe(false)
  })
})
