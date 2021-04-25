
const path = require('path')
const express = require('express')
const meetings = require('../controllers/meetings')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('meetings/meetings', { meetings: meetings.list() })
})

router.post('/', function (req, res) {
  const newMeeting = { GroupName: req.body.GroupName, StartTime: req.body.StartTime, EndTime: req.body.EndTime }
  meetings.add(newMeeting)
  res.redirect('/meetings')
})

module.exports = router
