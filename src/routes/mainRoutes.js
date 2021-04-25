
const express = require('express')
const mainRouter = express.Router()

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

mainRouter.get('/', function (req, res) {
  res.send('Hello Express')
})

mainRouter.get('/groups', function (req, res) {
  res.render('groups', { groups: groups })
})

mainRouter.post('/groups', function (req, res) {
  const name = req.body.name
  const newGroup = { name: name, members: [] }
  groups.push(newGroup)
  res.redirect('/groups')
})

mainRouter.get('/groups/new', function (req, res) {
  res.render('newGroup.ejs')
})

module.exports = mainRouter
