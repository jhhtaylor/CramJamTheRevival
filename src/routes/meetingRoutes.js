const path = require('path')
const express = require('express')
const meetings = require('../controllers/meetings')
const router = express.Router()
const { body } = require('express-validator')
const catchAsync = require('../../utils/catchAsync')
const { isLoggedIn } = require('../middleware/middleware')

router.route('/')
  .get(isLoggedIn, catchAsync(meetings.index))

router.route('/:meetingid')
  .get(isLoggedIn, catchAsync(meetings.show))


router.route('/new/:groupid')
  .get(isLoggedIn, meetings.renderNewForm)
  .post(
    isLoggedIn,
    body('name').escape().trim(),
    body('description').escape().trim(),
    catchAsync(meetings.createMeeting)
  )
module.exports = router
