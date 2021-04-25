
const path = require('path')
const express = require('express')
const students = require('../controllers/students')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('students/students', {  students: students.list() })
})

router.post('/', function (req, res) {
  const newStudent = {email:req.body.email, firstName:req.body.firstName, lastName:req.body.lastName, password:req.body.password}
  students.add(newStudent)
  res.redirect('/students')
})

module.exports = router
