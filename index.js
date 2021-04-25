const express = require('express')
const mainRouter = require('./src/routes/mainRoutes')
const meetingRouter = require('./src/routes/meetingsRoutes')
const db = require('./src/db')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate');

const port = 3000

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/',mainRouter)
app.use('/meetings', meetingRouter)
app.listen(port)

console.log('Blast it Chewie 💫 Express server running on port', port)
