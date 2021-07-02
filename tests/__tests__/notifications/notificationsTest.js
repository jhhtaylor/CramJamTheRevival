const { StudentProfile } = require('../../../src/db/studentProfiles')
const { GroupSchema } = require('../../../src/db/groups')
const { Tag } = require('../../../src/db/tags')
const { MeetingSchema } = require('../../../src/db/meetings')

const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const { index } = require('../../../src/controllers/notifications')
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
  await Tag.deleteMany({})
  await MeetingSchema.deleteMany({})
})

// will change once there is access to database
describe('Notification functionality', () => {

  test('A user can view their invite notifications', async (done) => {
    testStudent = new StudentProfile({
      email: 'test.member@test.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location: 'Wits',
      geodata: {
        type: 'Point',
        coordinates: [0,0]
      }
    })
    await testStudent.save()
  
    testGroup = new GroupSchema({
      name: 'Test Test',
      members: [],
      invites: [testStudent._id],
      tags: []
    })
    await testGroup.save()
    testStudent.invites.push(testGroup._id)
    await testStudent.save()
    const req = {
      user: testStudent,
      flash: function () { }
    }
    const res = { 
      redirect(url) { return url }, 
      render(url, obj) { return obj } 
    }

    const out = await index(req, res)

    expect(out.groupInvites[0]._id).toEqual(testGroup._id)
    done()
  })

  test('A user gets notified when they arrive home safe', async (done) => {
    testStudent = new StudentProfile({
      email: 'test.member@test.com',
      firstName: 'Member',
      lastName: 'Test',
      password: '',
      groups: [],
      location: 'Wits',
      geodata: {
        type: 'Point',
        coordinates: [0,0]
      }
    })
    await testStudent.save()
  
    testGroup = new GroupSchema({
      name: 'Test Test',
      members: [testStudent._id],
      invites: [],
      tags: []
    })
    await testGroup.save()
    testStudent.groups.push(testGroup._id)
    await testStudent.save()

    testAddress = '43 Dundalk Avenue parkview johannesburg'
    const now = new Date()
    let start = now 
    let end = now 
    start.setHours(now.getHours()-1)
    end.setHours(now.getHours()+1)

    let testMeeting = new MeetingSchema({
      name: 'Test meeting',
      group: testGroup._id,
      attendees: [testStudent._id],
      location:{
        type: 'Point',
        coords: [0,0]
      },
      start: start,
      end: end,
      homeStudents: [testStudent._id]
    })
    await testMeeting.save()
    testGroup.meetings.push(testMeeting._id)
    await testGroup.save()
    
    testUser = new StudentProfile({
      email: 'test.member@test.com1',
      firstName: 'Member1',
      lastName: 'Test',
      password: '',
      groups: [testGroup._id],
      invites: [],
      polls: [],
      location: 'Wits',
      geodata: {
        type: 'Point',
        coordinates: [0,0]
      }
    })

    const req = {
      user: testUser,
      flash: function () { }
    }
    const res = { 
      redirect(url) { return url }, 
      render(url, obj) { return obj } 
    }

    const out = await index(req, res)
    expect(out.meetingsInProgress[0]._id).toEqual(testMeeting._id)
    expect(out.meetingsInProgress[0].homeStudents[0]._id).toEqual(testStudent._id)
    done()
  })
})
