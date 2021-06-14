const path = require('path')
const express = require('express')
const meetings = require('../controllers/meetings')
const router = express.Router()
const { body } = require('express-validator')

router.get('/', function (req, res) {
  res.render('meetings/meetings', { meetings: meetings.list() })
})

// TODO: Refactor to make more restful and make use of the determineMeetingLocation function
router.post('/', body('GroupName').escape().trim(), function (req, res) {
  const newMeeting = {
    GroupName: req.body.GroupName,
    StartTime: req.body.StartTime,
    EndTime: req.body.EndTime
  }
  meetings.add(newMeeting)
  res.redirect('/meetings')
})

module.exports = router
