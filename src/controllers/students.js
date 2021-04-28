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

module.exports.registerStudent = async (student) => {
  const { email, firstName, lastName, password, username } = student
  const newStudent = new StudentProfile({ email, firstName, lastName, username })
  const savedStudent = await StudentProfile.register(newStudent, password)
  return savedStudent
}
