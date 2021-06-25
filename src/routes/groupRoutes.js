const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const { isLoggedIn } = require('../middleware/middleware')
const groups = require('../controllers/groups')
const { route } = require('./studentsRoutes')
const poll = require('../controllers/poll')
const router = express.Router()
const { body } = require('express-validator')

router.route('/').get(isLoggedIn, catchAsync(groups.index))

router
  .route('/new')
  .get(isLoggedIn, groups.renderNewForm)
  .post(
    isLoggedIn,
    body('name').escape().trim(),
    catchAsync(groups.createGroup)
  )
router
  .route('/tags')
  .get(isLoggedIn, catchAsync(groups.showTags))
router
  .route('/:id')
  .get(isLoggedIn, catchAsync(groups.showGroup))
  .delete(isLoggedIn, catchAsync(groups.deleteGroup))

// router.route('/:id/poll/:poll/:member')
//   .post(catchAsync(poll.votePoll))

router
  .route('/:id/edit/:member')
  .delete(isLoggedIn, catchAsync(groups.deleteGroupMember))

router.route('/:id/explore').get(isLoggedIn, catchAsync(groups.explore))

router.route('/:id/invite/:member').post(isLoggedIn, catchAsync(groups.inviteGroupMember))

router
  .route('/:id/acceptInvite')
  .post(isLoggedIn, catchAsync(groups.acceptInvite))

router
  .route('/:id/declineInvite')
  .post(isLoggedIn, catchAsync(groups.declineInvite))

module.exports = router
