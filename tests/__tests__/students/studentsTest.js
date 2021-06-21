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
beforeEach(async () => await StudentProfile.deleteMany({}))

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
      .send(`email=${data.email}&username=${data.username}&firstName=${data.firstName}&lastName=${data.lastName}&password=${data.password}&addressLine=${data.addressLine}&suburb=${data.suburb}&city=${data.city}`)
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
      password: 'test',
      addressLine: '20 Sunnyside Road',
      suburb: 'Orchards',
      city: 'Johannesburg'
    }
    const response = await request
      .post('/students/register')
      .send(`email=${data.email}&username=${data.username}&firstName=${data.firstName}&lastName=${data.lastName}&password=${data.password}&addressLine=${data.addressLine}&suburb=${data.suburb}&city=${data.city}`)
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
      .send(`email=${data.email}&username=${data.username}&firstName=${data.firstName}&lastName=${data.lastName}&password=${data.password}&addressLine=${data.addressLine}&suburb=${data.suburb}&city=${data.city}`)
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

  test('Getting settings page', async (done) => {
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
      rating: [],
      settings: { isSearchable: true }
    })
    const student = await std.save()
    const req = {
      params: { id: student._id },
      user: { _id: student._id }
    }
    const res1 = {
      render: function (str) { checkStringEquals(str, 'settings/edit') }
    }
    const res2 = {
      render: function (str) { checkStringEquals(str, 'settings/settings') }
    }
    await students.editSettings(req, res1)
    await students.getSettings(req, res2)
    done()
  })

  test('Getting settings page', async (done) => {
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
      rating: [],
      settings: { isSearchable: true }
    })
    const student = await std.save()
    const req = {
      params: { id: student._id },
      user: { _id: '' },
      flash: function (err, msg) {
        checkStringEquals(err, 'error')
        checkStringEquals(msg, 'Can only view your own settings')
      }
    }
    const res1 = {
      redirect: function (str) { checkStringEquals(str, '/') }
    }
    const res2 = {
      redirect: function (str) { checkStringEquals(str, '/') }
    }
    await students.editSettings(req, res1)
    await students.getSettings(req, res2)
    done()
  })

  test('Testing changing settings', async (done) => {
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
      rating: [],
      settings: { isSearchable: true }
    })
    const newUser = 'newUser'
    const newEmail = 'newEmail@email.email'
    const newLocation = 'newLocation'
    const student = await std.save()
    const req = {
      params: { id: student._id },
      user: { _id: student._id },
      flash: function () { },
      body: { username: newUser, email: newEmail, location: newLocation, isSearchable: undefined }
    }
    const res = { redirect: function () {} }
    await students.updateProfile(req, res)
    const studentCheck = await StudentProfile.findById(student._id)
    checkStringEquals(studentCheck.username, newUser)
    checkStringEquals(studentCheck.email, newEmail)
    checkStringEquals(studentCheck.location, newLocation)
    checkStringEquals(studentCheck.settings.isSearchable, false)
    done()
  })
})
