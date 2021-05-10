const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const groups = require('../controllers/groups')
const { route } = require('./studentsRoutes')
const router = express.Router()

router.route('/')
  .get(catchAsync(groups.index))

router.route('/new')
  .get(groups.renderNewForm)
  .post(catchAsync(groups.createGroup))
  
router.route('/:id/new/:member')
  .post(groups.addGroupMember); //new add member route

router.route('/:id')
  .get(catchAsync(groups.showGroup))
  .delete(catchAsync(groups.deleteGroup))

router.route('/:id/edit/:member')
  .delete(catchAsync(groups.deleteGroupMember))

router.route('/:id/explore')
  .get(catchAsync(groups.explore))

router.route('/:id/invite/:member')
  .post(catchAsync(groups.inviteGroupMember))

module.exports = router
