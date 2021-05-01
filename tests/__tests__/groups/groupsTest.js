const groups = require('../../../src/controllers/groups')
const { GroupSchema } = require('../../../src/db/groups')
const { dbConnect, dbDisconnect } = require('../../../utils/testUtils/dbTestUtils')

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })

// will change once there is access to database
describe('Group controller functionality', () => {
  test('A group can be added to the database', async () => {
    const testName = 'New Test Group'
    const req = { body: { name: testName } }
    const res = { redirect (url) { return url } }
    await groups.createGroup(req, res)
    const expectedGroup = await GroupSchema.findOne({})
    expect(testName).toEqual(expectedGroup.name)
  })
})
