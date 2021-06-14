const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const { isLoggedIn } = require('../middleware/middleware')
const links = require('../controllers/links')
const { body } = require('express-validator')

const router = express.Router()

router.route('/').get(isLoggedIn, catchAsync(links.index))


router.route('/new').get(isLoggedIn, catchAsync(links.renderNewForm))

router
  .route('/')
  .post(isLoggedIn, body('name').escape().trim(), catchAsync(links.createLink))

module.exports = router
