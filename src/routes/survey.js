const catchAsync = require('../../utils/catchAsync')
const survey = require('../controllers/survey')
const express = require('express')
const router = express.Router()

router.route('/:student')
  .post(catchAsync(survey.takeSurvey))

router.route('/')
  .get(survey.showSurvey)

module.exports = router
