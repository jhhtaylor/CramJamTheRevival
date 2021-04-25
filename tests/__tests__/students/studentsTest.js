const students = require('../../../src/controllers/students')

//will change once there is access to database
describe('Student controller functionality', () => {
    test('A student can be added', async () => {
       const prevLength = students.list().length 
        const newStudent = {
        email: "test@email.com",
        firstName:"Test",
        lastName:"Test",
        password:"password"
      }
      students.add(students)
      const newLength = students.list().length
      expect(newLength-prevLength).toBe(1)
    })
})