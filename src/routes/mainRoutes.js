const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const Search = require('../controllers/search')
const { isLoggedIn } = require('../middleware/middleware')
const mainRouter = express.Router()

mainRouter.route('/').get(function (req, res) {
  res.render('index')
})

mainRouter.route('/search')
  .get(isLoggedIn, catchAsync(Search.search))

module.exports = mainRouter
