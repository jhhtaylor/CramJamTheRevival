const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const { isLoggedIn } = require('../middleware/middleware')
const groups = require('../controllers/groups')
const { route } = require('./studentsRoutes')
const poll = require('../controllers/poll')
const router = express.Router()

router.route('/')
  .get(isLoggedIn, catchAsync(groups.index))

router.route('/new')
  .get(isLoggedIn, groups.renderNewForm)
  .post(isLoggedIn, catchAsync(groups.createGroup))

router.route('/:id')
  .get(catchAsync(groups.showGroup))
  .delete(isLoggedIn, catchAsync(groups.deleteGroup))

// router.route('/:id/poll/:poll/:member')
//   .post(catchAsync(poll.votePoll))

router.route('/:id/edit/:member')
  .delete(isLoggedIn, catchAsync(groups.deleteGroupMember))

router.route('/:id/explore')
  .get(catchAsync(groups.explore))

router.route('/:id/invite/:member')
  .post(catchAsync(groups.inviteGroupMember))

router.route('/:id/acceptInvite')
  .post(isLoggedIn, catchAsync(groups.acceptInvite))

router.route('/:id/declineInvite')
  .post(isLoggedIn, catchAsync(groups.declineInvite))

module.exports = router
