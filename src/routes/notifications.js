const express = require('express')
const router = express.Router()
const notifications = require('../controllers/notifications')
const catchAsync = require('../../utils/catchAsync')
const { isLoggedIn } = require('../middleware/middleware')

router.route('/')
  .get(isLoggedIn, catchAsync(notifications.index))

module.exports = router
