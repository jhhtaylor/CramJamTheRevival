
const path = require('path')
const express = require('express')
const groups = require('../../public/js/groups')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('groups', { groups: groups.list() })
})

router.post('/', function (req, res) {
  const name = req.body.name
  const newGroup = { name: name, members: [] }
  groups.add(newGroup)
  res.redirect('/groups')
})

router.get('/new', function (req, res) {
  res.render('newGroup.ejs')
})

module.exports = router
