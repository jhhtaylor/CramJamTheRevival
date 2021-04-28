
const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const groups = require('../controllers/groups')
const router = express.Router()

router.route('/')
  .get(catchAsync(groups.index))
  .post(catchAsync(groups.createGroup))

router.get('/new', groups.renderNewForm)

module.exports = router
