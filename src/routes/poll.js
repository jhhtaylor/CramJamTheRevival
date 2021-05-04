const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const poll = require('../controllers/poll')
const { isPartOfVote } = require('../middleware/middleware')
const router = express.Router()

router.route('/')
  .get(catchAsync(poll.showAllPolls))
  .post(catchAsync(poll.createPoll))

router.route('/:poll')
  .get(isPartOfVote, catchAsync(poll.showPoll))
  .post(isPartOfVote, catchAsync(poll.votePoll))

module.exports = router
