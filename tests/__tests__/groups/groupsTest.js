const groups = require('../../../src/controllers/groups')
const GroupSchema = require('../../../src/db/groups')
const { dbConnect, dbDisconnect } = require('../../../utils/testUtils/dbTestUtils')

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })

// will change once there is access to database
describe('Group controller functionality', () => {
  test('A group can be added to the database', async () => {
    const testName = 'New Test Group'
    groups.createGroup(testName)
    const expectedGroup = await GroupSchema.find({})
    expect(testName).toEqual(expectedGroup.name)
  })
})
