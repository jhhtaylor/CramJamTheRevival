
const path = require('path')
const express = require('express')
const meetings = require('../controllers/meetings')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('meetings', { groups: groups.list() })
})

router.post('/', function (req, res) {
  const name = req.body.name
  const newGroup = { name: name, members: [] }
  groups.add(newGroup)
  res.redirect('/meetings')
})

router.get('/create', function (req, res) {
  res.render('meetings/createMeeting.ejs')
})

module.exports = router
