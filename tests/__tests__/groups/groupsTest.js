const groups = require('../../../src/controllers/groups')

// will change once there is access to database
describe('Group controller functionality', () => {
  test('A group can be added', async () => {
    const prevLength = groups.list().length
    const newGroup = {
      name: 'New Test Group',
      members: []
    }
    groups.add(newGroup)
    const newLength = groups.list().length
    expect(newLength - prevLength).toBe(1)
  })
})
