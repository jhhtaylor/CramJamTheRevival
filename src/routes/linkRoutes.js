const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const { isLoggedIn } = require('../middleware/middleware')
const links = require('../controllers/links')
// const { route } = require('./studentsRoutes')
// const poll = require('../controllers/poll')
const router = express.Router()

router.route('/')
  .get(isLoggedIn, catchAsync(links.index))

module.exports = router
