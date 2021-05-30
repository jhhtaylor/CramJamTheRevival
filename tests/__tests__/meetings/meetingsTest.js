const { getGeoData } = require('../../../seeds/locationHelper')
const meetings = require('../../../src/controllers/meetings')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')

// will change once there is access to database
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
    expect(newLength - prevLength).toBe(1)
  })

  test('Selects the central location for the meeting location', () => {
    const students = []
    for (let i = 0; i < 4; i++) {
      const newStudent = getGeoData()
      students.push(newStudent)
    }
    const meetingLocation = meetings.determineMeetingLocation(students)
    checkNotEmpty(meetingLocation)
    expect(students).toContainEqual(meetingLocation)
  })
})
