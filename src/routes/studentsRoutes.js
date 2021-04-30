
const path = require('path')
const express = require('express')
const passport = require('passport')
const students = require('../controllers/students')
const catchAsync = require('../../utils/catchAsync')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('students/students', { students: students.list() })
})

router.post('/', function (req, res) {
  const newStudent = { email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, password: req.body.password }
  students.add(newStudent)
  res.redirect('/students')
})

router.route('/register')
  .get(students.renderRegisterStudent)
  .post(catchAsync(students.registerStudent))

router.route('/login')
  .get(students.renderLogin)
  .post(passport.authenticate('local', { failureRedirect: '/students/login', failureFlash: true }), catchAsync(students.loginStudent))

router.route('/logout')
  .get(students.logoutStudent)

module.exports = router
