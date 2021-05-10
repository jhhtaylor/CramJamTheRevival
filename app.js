const path = require('path')
const express = require('express')

// loading routers
const mainRouter = require('./src/routes/mainRoutes')
const meetingRouter = require('./src/routes/meetingRoutes')
const groupRouter = require('./src/routes/groupRoutes')
const studentRouter = require('./src/routes/studentsRoutes')
const db = require('./src/db')
const app = express()
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use('/', mainRouter)
app.use('/students', studentRouter)
app.use('/groups', groupRouter)
app.use('/meetings', meetingRouter)

module.exports = app
