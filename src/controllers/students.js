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

module.exports.renderRegisterStudent = (req, res) => {
  res.render('students/register')
}

module.exports.registerStudent = async (req, res) => {
  const { email, firstName, lastName, password, username } = req.body
  const newStudent = new StudentProfile({ email, firstName, lastName, username })
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
