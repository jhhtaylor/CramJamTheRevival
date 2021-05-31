const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const { isLoggedIn } = require('../middleware/middleware')
const activityLog = require('../controllers/activityLog')
const router = express.Router()

router.route('/')
  .get(isLoggedIn, catchAsync(activityLog.viewLog))

module.exports = router
