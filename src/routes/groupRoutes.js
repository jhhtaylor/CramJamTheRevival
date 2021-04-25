
const path = require('path')
const express = require('express')
const groups = require('../controllers/groups')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('groups/groups', { groups: groups.list() })
})
router.get('/:id', function (req, res) {
  res.render('groups/' + req.params.id)
})
router.post('/create', function (req, res) {
  groups.add(req.body.name)
  res.redirect(req.baseUrl)
})
router.post('/edit', function (req, res) {
  groups.deleteMember(req.body.groupName, req.body.studentName)
  res.redirect(req.baseUrl)
})

module.exports = router
