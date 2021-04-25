
const path = require('path')
const express = require('express')
const groups = require('../controllers/groups')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('groups/groups', { groups: groups.list() })
})

router.post('/', function (req, res) {
  groups.add(req.body.name)
  res.redirect('/groups')
})

router.get('/create', function (req, res) {
  res.render('groups/createGroup')
})

module.exports = router
