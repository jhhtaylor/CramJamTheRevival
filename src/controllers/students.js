const { StudentProfile } = require('../db/studentProfiles')

const students = [{
  email: 'blake@email.com',
  firstName: 'Blake',
  lastName: 'Denham',
  password: 'Awe'
}]

module.exports.add = (newStudent) => {
  students.push(newStudent)
}

module.exports.list = () => {
  return students
}

module.exports.explore = async (req, res) => {
  const students = await StudentProfile.find({})
  res.render('students/students', { students })
}
module.exports.showNotifications = (req, res) => {
  res.render('notifications')
}
module.exports.renderRegisterStudent = (req, res) => {
  res.render('students/register')
}

module.exports.registerStudent = async (req, res) => {
  const { email, firstName, lastName, password, username } = req.body
  const location = 'Wits'
  const coordinates = [28.0305, -26.1929] // longitude latitude for wits
  // hardcoded geolocation data which will become part of the form at some point
  const geodata = {
    type: 'Point',
    coordinates
  }
  const newStudent = new StudentProfile({ email, firstName, lastName, username, location, geodata })
  const savedStudent = await StudentProfile.register(newStudent, password)
  res.redirect('/')
}

module.exports.renderLogin = (req, res) => {
  res.render('students/login')
}

module.exports.loginStudent = async (req, res) => {
  req.flash('success', 'Successfully logged in!')
  res.redirect('/')
}

module.exports.logoutStudent = (req, res) => {
  req.logout()
  req.flash('success', 'Successfully Logged Out!')
  res.redirect('/')
}
