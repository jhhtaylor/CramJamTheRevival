const { StudentProfile } = require('../db/studentProfiles')
const { Tag } = require('../db/tags')
const geocodeAddress = require('../../utils/geocodeAddress')

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
module.exports.renderRegisterStudent = async (req, res) => {
  const students = await StudentProfile.find({})
  res.render('students/register', { allStudents: students })
}

module.exports.registerStudent = async (req, res) => {
  const { email, firstName, lastName, password, username, addressLine, suburb, city } = req.body
  const location = `${addressLine}, ${suburb}, ${city}`
  const coordinates = await geocodeAddress.getGeocode(location)
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

module.exports.rateStudent = async (req, res) => {
  const { id } = req.params
  const { rating } = req.body
  const raterID = req.user._id
  const studentRating = { rated: parseInt(rating), rater: raterID }
  await StudentProfile.findByIdAndUpdate(id, { $push: { rating: studentRating } })
  res.redirect('back')
}

module.exports.getSettings = async (req, res) => {
  const { id } = req.params
  if (id != req.user._id) {
    req.flash('error', 'Can only view your own settings')
    res.redirect('/')
    return
  }
  res.render('settings/settings')
}

module.exports.editSettings = async (req, res) => {
  const { id } = req.params
  if (id != req.user._id) {
    req.flash('error', 'Can only view your own settings')
    res.redirect('/')
    return
  }
  const students = await StudentProfile.find({})
  res.render('settings/edit', { allStudents: students })
}

module.exports.getProfile = async (req, res) => {
  const { id } = req.params
  const profile = await StudentProfile.findById(id).populate('groups')
  const tags = await Tag.find({id: { $in: profile.groups.map(group => group.tag) } })
  console.log(tags)
  res.render('students/profile.ejs', { profile: profile, tags: tags })
}

module.exports.updateProfile = async (req, res) => {
  const { id } = req.params
  const { email, username, location, isSearchable, locationViewable } = req.body
  let searchable = true
  let viewable = true
  if (!isSearchable) searchable = false
  if (!locationViewable) viewable = false
  if (id != req.user._id) {
    req.flash('error', 'Can only view your own settings')
    res.redirect('/')
    return
  }
  // TODO: convert location into a geolocation as well
  const student = await StudentProfile.findByIdAndUpdate(id, {
    $set: {
      email: email,
      username: username,
      location: location,
      settings:
    { isSearchable: searchable, locationViewable: viewable }
    }
  })
  res.redirect(`/students/settings/${id}`)
}
