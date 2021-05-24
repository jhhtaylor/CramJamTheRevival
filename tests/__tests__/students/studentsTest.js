const students = require('../../../src/controllers/students')
const { StudentProfile } = require('../../../src/db/studentProfiles')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const { app } = require('../../../utils/testUtils/expressTestUtils')
const supertest = require('supertest')
const { getGeoData } = require('../../../seeds/locationHelper')
const { checkout } = require('../../../src/routes/mainRoutes')
const Mongoose = require('mongoose')
const request = supertest.agent(app)

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
    const res = { redirect (url) { return url } }
    const req = { body: newStudent }
    await students.registerStudent(req, res)
    const retrieved = await StudentProfile.findOne({ email: newStudent.email })
    checkNotEmpty(retrieved)
    checkStringEquals(retrieved.email, newStudent.email)
    checkStringEquals(retrieved.firstName, newStudent.firstName)
    checkStringEquals(retrieved.lastName, newStudent.lastName)
    checkStringEquals(retrieved.username, newStudent.username)
    StudentProfile.deleteMany({})
  })

  test('A student can view the register page', async (done) => {
    const response = await request.get('/students/register')
    expect(response.status).toBe(200)
    done()
  })

  test('A student can view the login page', async (done) => {
    const response = await request.get('/students/login')
    expect(response.status).toBe(200)
    done()
  })

  test('A student can register through the post request', async (done) => {
    const data = {
      email: 'testing@testuser.testing.test',
      firstName: 'TestUserFirst',
      lastName: 'TestUserLast',
      groups: [],
      username: 'Test',
      password: 'test'
    }
    const response = await request
      .post('/students/register')
      .send(`email=${data.email}&username=${data.username}&firstName=${data.firstName}&lastName=${data.lastName}&password=${data.password}`)
    expect(response.status).toBe(302) // 302 is redirect
    const user = await StudentProfile.findOne({ email: data.email })
    checkNotEmpty(user)
    checkStringEquals(user.email, data.email)
    checkStringEquals(user.username, data.username)
    checkStringEquals(user.firstName, data.firstName)
    checkStringEquals(user.lastName, data.lastName)
    await StudentProfile.deleteMany({})
    done()
  })

  test('A student can login', async (done) => {
    const data = {
      email: 'testing@testuser.testing.test',
      firstName: 'TestUserFirst',
      lastName: 'TestUserLast',
      groups: [],
      username: 'Test',
      password: 'test'
    }
    const response = await request
      .post('/students/register')
      .send(`email=${data.email}&username=${data.username}&firstName=${data.firstName}&lastName=${data.lastName}&password=${data.password}`)
    expect(response.status).toBe(302) // 302 is redirect
    const user = await StudentProfile.findOne({ email: data.email })
    const loginResponse = await request
      .post('/students/login')
      .send(`username=${data.username}&password=${data.password}`)
    expect(loginResponse.status).toBe(302)
    expect(loginResponse.header.location).toContain('/') // they were returned to home page
    await StudentProfile.deleteMany({})
    done()
  })

  test('A student can\'t login using bad credentials', async (done) => {
    const data = {
      email: 'testing@testuser.testing.test',
      firstName: 'TestUserFirst',
      lastName: 'TestUserLast',
      groups: [],
      username: 'Test',
      password: 'test'
    }
    const response = await request
      .post('/students/register')
      .send(`email=${data.email}&username=${data.username}&firstName=${data.firstName}&lastName=${data.lastName}&password=${data.password}`)
    expect(response.status).toBe(302) // 302 is redirect
    const user = await StudentProfile.findOne({ email: data.email })
    const loginResponse = await request
      .post('/students/login')
      .send(`username=${data.username}&password=notthepassword`)
    expect(loginResponse.status).toBe(302)
    expect(loginResponse.header.location).toContain('/students/login') // they failed to login
    await StudentProfile.deleteMany({})
    done()
  })

  test('A student can vote', async (done) => {
    const data = getGeoData()
    const location = data.location
    const geodata = data.geodata
    const std = new StudentProfile({
      email: 'testing@testuser.testing.test',
      firstName: 'TestUserFirst',
      lastName: 'TestUserLast',
      groups: [],
      username: 'Test',
      password: 'test',
      location,
      geodata,
      rating: []
    })
    const rating = 5
    const student = await std.save()
    const user = { _id: Mongoose.Types.ObjectId() }
    const req = { params: { id: student._id }, body: { rating }, user }
    const res = {
      redirect: async function () {
        const checkStudent = await StudentProfile.findById(student._id)
        const ratings = checkStudent.rating.map(e => {
          return e.rated
        })
        expect(ratings).toContain(rating)
        await StudentProfile.deleteMany({})
        done()
      }
    }
    students.rateStudent(req, res)
  })
})
