const express = require('express')
const path = require('path')
const studentRouter = require('../../src/routes/studentsRoutes')

module.exports.createApp = function () {
  const app = express()
  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, '../../views'))
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use('/students', studentRouter)
  return app
}
