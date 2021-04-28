
const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const groups = require('../controllers/groups')
const router = express.Router()

router.route('/')
  .get(catchAsync(groups.index))
  .post(catchAsync(groups.createGroup))

router.get('/new', groups.renderNewForm)

router.route('/:id')
  .get(catchAsync(groups.showGroup))
  .delete(catchAsync(groups.deleteGroup))

module.exports = router
