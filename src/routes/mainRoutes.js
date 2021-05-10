const express = require('express')
const mainRouter = express.Router()

mainRouter.get('/', function (req, res) {
  res.render('index')
})

mainRouter.get('/notifications', function (req, res) {
  res.render('notifications')
})

module.exports = mainRouter
