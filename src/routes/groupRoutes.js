const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const groups = require('../controllers/groups')
const poll = require('../controllers/poll')
const router = express.Router()

router.route('/')
  .get(catchAsync(groups.index))

router.route('/new')
  .get(groups.renderNewForm)
  .post(catchAsync(groups.createGroup))

router.route('/:id')
  .get(catchAsync(groups.showGroup))
  .delete(catchAsync(groups.deleteGroup))

// router.route('/:id/poll/:poll/:member')
//   .post(catchAsync(poll.votePoll))

router.route('/:id/edit/:member')
  .delete(catchAsync(groups.deleteGroupMember))

module.exports = router
