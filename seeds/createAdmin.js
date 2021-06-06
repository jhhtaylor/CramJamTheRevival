const { StudentProfile } = require('../src/db/studentProfiles')
const { getGeoData } = require('./locationHelper')
const { db } = require('../src/db')

async function createAdmin () {
  await StudentProfile.deleteOne({ username: 'admin' })
  const data = getGeoData()
  const admin = new StudentProfile({
    email: 'admin@admin.admin',
    firstName: 'admin',
    lastName: 'admin',
    groups: [],
    username: 'admin',
    invites: [],
    location: 'admin',
    geodata: { type: 'Point', cooridantes: [0, 0] }
  })

  await StudentProfile.register(admin, 'admin')
}

createAdmin().then(() => {
  console.log('Admin Created')
  db.close()
}
)
