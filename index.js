const path = require('path')
const express = require('express')

// loading routers
const mainRouter = require('./src/routes/mainRoutes')
const groupRouter = require('./src/routes/groupRoutes')
const meetingRouter = require('./src/routes/meetingRoutes')

const db = require('./src/db')

const app = express()
const ejsMate = require('ejs-mate');

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))

const port = 3000

app.use('/', mainRouter)
app.use('/groups', groupRouter)
app.use('/meetings', meetingRouter)


app.listen(port)

console.log('Blast it Chewie 💫 Express server running on port', port)
