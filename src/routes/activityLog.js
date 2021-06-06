const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const { isAdmin } = require('../middleware/middleware')
const activityLog = require('../controllers/activityLog')
const router = express.Router()

router.route('/')
  .get(isAdmin, catchAsync(activityLog.viewLog))

module.exports = router
