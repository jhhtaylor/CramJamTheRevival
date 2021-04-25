const express = require('express')

// loading routers
const mainRouter = require('./src/routes/mainRoutes')
const groupRouter = require('./src/routes/groupRoutes')

const db = require('./src/db')

const app = express()

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')
const port = 3000

app.use('/', mainRouter)
app.use('/groups', groupRouter)
app.listen(port)

console.log('Blast it Chewie 💫 Express server running on port', port)
