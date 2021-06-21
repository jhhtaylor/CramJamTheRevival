const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const poll = require('../controllers/poll')
const { isPartOfVote, isLoggedIn } = require('../middleware/middleware')
const router = express.Router()

// TODO: Refactor this to be part of the group routes

router.route('/')
  .get(isLoggedIn, catchAsync(poll.showAllPolls))

router.route('/:groupId/:action/:memberId')
  .post(catchAsync(poll.createPoll))

router.route('/:poll')
  .get(catchAsync(isPartOfVote), catchAsync(poll.showPoll))

router.route('/:poll/:type')
  .post(catchAsync(isPartOfVote), catchAsync(poll.votePoll))

module.exports = router
