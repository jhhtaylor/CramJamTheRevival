const path = require('path')
const express = require('express')
const { REFUSED } = require('dns')
const mainRouter = express.Router()

mainRouter.get('/', function (req, res) {
  res.send('Hello Express')
})

module.exports = mainRouter
