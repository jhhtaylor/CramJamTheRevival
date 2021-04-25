const meetings = require('../../../src/controllers/meetings')

//will change once there is access to database
describe('Meeting controller functionality', () => {
    test('A meeting can be added', async () => {
       const prevLength = meetings.list().length 
        const newMeeting = {
        GroupName: 'New Test Group',
        StartTime: '12:00',
        EndTime: '1:00'
      }
      meetings.add(newMeeting)
      const newLength = meetings.list().length
      expect(newLength-prevLength).toBe(1)
    })
})