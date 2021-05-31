const path = require('path')
const express = require('express')
const catchAsync = require('../../utils/catchAsync')
const { isLoggedIn } = require('../middleware/middleware')
const links = require('../controllers/links')
// const { route } = require('./studentsRoutes')
// const poll = require('../controllers/poll')
const router = express.Router()

router.route('/')
  .get(isLoggedIn, catchAsync(links.index))

router.post('/', function (req, res) {
  const { name, url } = req.body
  const newLink = { name: name, url: url }
  links.push(newLink)

  res.redirect('/')
})

router.get('/new', function (req, res) {
  res.render('links/new.ejs')
})

module.exports = router
