const express = require('express')
const mainRouter = express.Router()

mainRouter.get('/', function (req, res) {
  res.render('index')
})

module.exports = mainRouter
