const express = require('express')
const path = require('path')
const studentRouter = require('../../src/routes/studentsRoutes')
const groupRouter = require('../../src/routes/groupRoutes')

const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../../views'))
app.use(express.static(path.join(__dirname, '../../public')))
app.use(express.urlencoded({ extended: true }))
app.use('/students', studentRouter)
app.use('/groups', groupRouter)

module.exports.app = app
