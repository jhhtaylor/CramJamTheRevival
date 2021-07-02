const { StudentProfile } = require('../../../src/db/studentProfiles')
const { GroupSchema } = require('../../../src/db/groups')
const { Tag } = require('../../../src/db/tags')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const { search } = require('../../../src/controllers/search')

let testStudent
let testGroup
let testTag

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })
beforeEach(async () => {
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})
  await Tag.deleteMany({})

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
  testStudent.groups.push(testGroup._id)
  await testStudent.save()

  testTag = new Tag({
    name: 'Test',
    groups: [testGroup._id]
  })
  await testTag.save()
  testGroup.tags.push(testTag._id)
  await testGroup.save()

})

// will change once there is access to database
describe('Search functionality', () => {

  test('A user can search anything', async (done) => {
    const req = {
      query: { search: 'Test' },
      user: testStudent,
      flash: function () { }
    }
    const res = { 
      redirect(url) { return url }, 
      render(url, obj) { return obj } 
    }
    
    const obj = await search(req, res)
    expect(obj.foundGroups[0]._id).toEqual(testGroup._id)
    expect(obj.groupsWithTags[0]._id).toEqual(testGroup._id)
    expect(obj.foundStudents[0]._id).toEqual(testStudent._id)
    expect(obj.userSearched).toEqual('Test')
    expect(obj.total).toEqual(3)
    done()
  })

  test('Nothing will happen if nothing was searched', async (done) => {
    const req = {
      query: { search: '' },
      user: testStudent,
      flash: function () { }
    }
    const res = { 
      redirect(url) { return url }, 
      render(url, obj) { return obj } 
    }
    
    const url = await search(req, res)
    expect(url).toEqual('back')
    done()
  })
})
