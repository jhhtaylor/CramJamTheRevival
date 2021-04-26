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
  const { email, firstName, lastName, password } = req.body
  const newStudent = new StudentProfile({ email, firstName, lastName })
  StudentProfile.register(newStudent, password)
}
