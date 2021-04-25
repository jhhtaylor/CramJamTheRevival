
const express = require('express')
const mainRouter = express.Router()
const meetings = require('../controllers/meetings')

mainRouter.get('/', function (req, res) {
  res.send('Hello Express')
})

module.exports = mainRouter
