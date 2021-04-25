
const path = require('path')
const express = require('express')
const groups = require('../../public/js/groups')
const router = express.Router()

const groups = [
  {
    name: 'Study Group 1',
    members: ['Tori', 'Duncan', 'Blake']
  },

  {
    name: 'Study Group 2',
    members: ['Jon', 'Josh', 'Jess Spatula']
  }
]

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'class', 'index.html'))
})
router.get('/create', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'class', 'create.html'))
})
router.get('/delete', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'class', 'delete.html'))
})
router.post('/edit', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'class', 'edit.html'))
})

module.exports = router
