const students = require('../../../src/controllers/students')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })

// will change once there is access to database
describe('Student controller functionality', () => {
  test('A student can be added', async () => {
    const prevLength = students.list().length
    const newStudent = {
      email: 'test@email.com',
      firstName: 'Test',
      lastName: 'Test',
      password: 'password'
    }
    students.add(students)
    const newLength = students.list().length
    expect(newLength - prevLength).toBe(1)
  })

  test('A student can register', async () => {
    const first = 'Ethan'
    const last = 'Spoon'
    const pw = 'test'
    const newStudent = {
      email: 'newStudent@student.student',
      firstName: first,
      lastName: last,
      groups: [],
      username: `${first}${last}`,
      password: pw
    }
    await students.registerStudent(newStudent) // registering a student requires a password, but not passed in on the object
    const retrieved = await StudentProfile.findOne({ email: newStudent.email })
    checkNotEmpty(retrieved)
    checkStringEquals(retrieved.email, newStudent.email)
    checkStringEquals(retrieved.firstName, newStudent.firstName)
    checkStringEquals(retrieved.lastName, newStudent.lastName)
    checkStringEquals(retrieved.username, newStudent.username)
    StudentProfile.deleteMany({})
  })
})
