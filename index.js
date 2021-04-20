const express = require('express')
const mainRouter = require('./mainRoutes')
const app = express()

const port = 3000

app.use(mainRouter)
app.listen(port)

console.log('Blast it Chewie 💫 Express server running on port', port)
