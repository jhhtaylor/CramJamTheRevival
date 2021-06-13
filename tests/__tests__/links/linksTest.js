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

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
beforeEach(async () => {
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})
})

describe('Link controller functionality', () => {
  test('A user cannot view the links page if not logged in', async (done) => {
    const response = await request.get('/links')
    expect(response.status).toBe(302) // redirect since user is not logged in
    done()
  })

  test('A link can be added to the database', async () => {
    const testName = 'New Test Link'
    const testUrl = 'https://www.google.com/'
    // can't test the new user relation functionality as cannot simulate signing in...
    const req = {
      body: { name: testName, url: testUrl }

    }

    const res = { redirect(url) { return url } }
    await links.createLink(req, res)
    const expectedLink = await LinkSchema.findOne({})
    expect(expectedLink.name).toEqual(testName)
    expect(expectedLink.url).toEqual(testUrl)
  })
})
