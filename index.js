const path = require('path')
const express = require('express')
const app = express()
const mainRouter = express.Router()

mainRouter.get('/', function (req, res) {
  res.send('Hello Express')
})

app.use(mainRouter)
app.listen(3000)
console.log('Blast it Chewie 💫')
