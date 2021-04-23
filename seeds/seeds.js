const { StudentProfile } = require('../src/db/studentProfiles')
const { db } = require('../src/db')

const studentFirstNames = ['Dave', 'Steve', 'Will', 'Jess', 'Emily', 'Rebecca']
const studentLastNames = ['Stevens', 'Williams', 'Denham', 'Tobias', 'Taylor', 'Bench']

async function generateStudents (firstNames, lastNames, numStudents) {
  const insertStudents = []

  // generate a random set of user profile data
  for (let i = 0; i < numStudents; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const newStudent = {
      email: `${firstName}.${lastName}${i}@test.com`,
      firstName: firstName,
      lastName: lastName,
      password: '',
      groups: []
    }
    insertStudents.push(newStudent)
  }
  // Deletes all the current data in there to start fresh
  await StudentProfile.collection.drop()
  console.log('Dropped Students Collection 🔮')
  // Inserts many students into a mongodb collection
  await StudentProfile.insertMany(insertStudents)
  console.log('Inserted New Students 💎')
}
generateStudents(studentFirstNames, studentLastNames, 10)
  .then(() => {
    db.close()
  })
  .catch(err => {
    console.error('Error:', err)
  })
