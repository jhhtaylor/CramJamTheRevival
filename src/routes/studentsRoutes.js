const path = require('path')
const express = require('express')
const passport = require('passport')
const students = require('../controllers/students')
const catchAsync = require('../../utils/catchAsync')
const router = express.Router()
const { body } = require('express-validator')
const { isLoggedIn } = require('../middleware/middleware')

router.get('/', function (req, res) {
  res.render('students/students', { students: students.list() })
})

router.post('/', function (req, res) {
  const newStudent = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password
  }
  students.add(newStudent)
  res.redirect('/students')
})

router.route('/vote/:id/').post(catchAsync(students.rateStudent))

router
  .route('/register')
  .get(students.renderRegisterStudent)
  .post(
    body('email').isEmail().escape().trim(),
    body('username').escape().trim(),
    body('firstName').escape().trim(),
    body('lastName').escape().trim(),
    catchAsync(students.registerStudent)
  )

router
  .route('/login')
  .get(students.renderLogin)
  .post(
    body('username').escape().trim(),
    passport.authenticate('local', {
      failureRedirect: '/students/login',
      failureFlash: true
    }),
    catchAsync(students.loginStudent)
  )

router.route('/settings/:id')
  .get(isLoggedIn, students.getSettings)

router.route('/settings/:id/edit')
  .get(isLoggedIn, students.editSettings)
  .put(isLoggedIn, catchAsync(students.updateProfile))

router.route('/logout').get(students.logoutStudent)

module.exports = router
