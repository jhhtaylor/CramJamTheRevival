const { StudentProfile } = require('../db/studentProfiles')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const admin = new StudentProfile({
    username: 'admin',
    firstName: 'admin',
    lastName: 'admin',
    email: 'admin@admin.admin',
    settings: { isSearchable: false, locationViewable: false },
    location: 'Rosebank',
    geodata: { type: 'Point', cooridantes: [0, 0] },
    isAdmin: true
  })
  await StudentProfile.deleteOne({ username: 'admin' }) // deletes old admin
  await StudentProfile.register(admin, process.env.ADMIN_PASS) // registers new admin
  res.redirect('/')
})

module.exports = router
