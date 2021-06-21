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
let testGroup

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

  testGroup = new GroupSchema({
    name: 'New Test Group',
    members: testStudent._id
  })
  await testGroup.save()
})

describe('Link controller functionality', () => {
  test('A user cannot view the links page if not logged in', async (done) => {
    const response = await request.get('/links')
    expect(response.status).toBe(302) // redirect since user is not logged in
    done()
  })

  test('A link can be added to the database', async () => {
    const testName = 'New Test Link'
    const testNote = 'New Test Note'
    const testUrl = 'https://www.google.com/'
    const req = {
      body: {
        name: testName,
        note: testNote,
        url: testUrl // ,
        // user: testStudent._id,
        // group: testGroup._id
      }

    }

    const res = { redirect(url) { return url } }
    await links.createLink(req, res)
    const expectedLink = await LinkSchema.findOne({})
    expect(expectedLink.name).toEqual(testName)
    expect(expectedLink.note).toEqual(testNote)
    expect(expectedLink.url).toEqual(testUrl)
    // Cannot test these as need to be logged in :(
    // console.log(expectedLink)
    // expect(expectedLink.user._id).toEqual(testStudent._id)
    // Cannot test as require user input (selectedGroup)
    // expect(expectedLink.group._id).toEqual(testGroup._id)
  })
})
