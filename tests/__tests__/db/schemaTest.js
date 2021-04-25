const { StudentProfile } = require('../../../src/db/studentProfiles')
const { GroupSchema } = require('../../../src/db/groups')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })

describe('Profile test suite', () => {
  test('should save new profile to database', async () => {
    const newProfile = new StudentProfile({
      email: 'newUser@gmail.com',
      firstName: 'Steve',
      lastName: 'Mojang',
      groups: []
    })
    const newSavedProfile = await newProfile.save()
    checkNotEmpty(newProfile)
    checkStringEquals(newProfile.email, newSavedProfile.email)
    checkStringEquals(newProfile.firstName, newSavedProfile.firstName)
    checkStringEquals(newProfile.lastName, newSavedProfile.lastName)
  })

  test('should retrieve profile from the database', async () => {
    const newProfile = new StudentProfile({
      email: 'retrieveUser@gmail.com',
      firstName: 'Jess',
      lastName: 'Spatula',
      groups: []
    })
    const newSavedProfile = await newProfile.save()
    const checkProfile = await StudentProfile.findOne({ email: newProfile.email })
    checkNotEmpty(checkProfile)
    checkStringEquals(newSavedProfile.email, checkProfile.email)
    checkStringEquals(newSavedProfile.firstName, checkProfile.firstName)
    checkStringEquals(newSavedProfile.lastName, checkProfile.lastName)
  })

  test('should update profile in the database', async () => {
    const newProfile = new StudentProfile({
      email: 'oldUser@gmail.com',
      firstName: 'Jess',
      lastName: 'Spatula',
      groups: []
    })
    const newEmail = 'updatedUser@gmail.com'
    const newSavedProfile = await newProfile.save()
    const checkProfile = await StudentProfile.findOneAndUpdate({ email: newProfile.email }, { $set: { email: newEmail } }, { new: true })
    checkNotEmpty(checkProfile)
    checkStringEquals(checkProfile.email, newEmail)
  })
})

describe('Group test suite', () => {
  test('should save group database', async () => {
    const group = new GroupSchema({
      name: 'Test Group'
    })
    const savedGroup = await group.save()
    checkNotEmpty(savedGroup)
    checkStringEquals(savedGroup.name, group.name)
  })

  test('should find group in database', async () => {
    const group = new GroupSchema({
      name: 'Test Group'
    })
    const savedGroup = await group.save()
    const checkGroup = await GroupSchema.findOne({ name: savedGroup.name })
    checkNotEmpty(checkGroup)
    checkStringEquals(checkGroup.name, group.name)
  })

  test('should update group in the database', async () => {
    const group = new GroupSchema({
      name: 'Test Group'
    })
    const savedGroup = await group.save()
    const newName = 'Updated Name'
    const checkGroup = await GroupSchema.findOneAndUpdate({ name: savedGroup.name }, { $set: { name: newName } }, { new: true })
    checkNotEmpty(checkGroup)
    checkStringEquals(checkGroup.name, newName)
  })
})
