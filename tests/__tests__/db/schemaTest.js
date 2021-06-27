const { StudentProfile } = require('../../../src/db/studentProfiles')
const { GroupSchema } = require('../../../src/db/groups')
const { MeetingSchema } = require('../../../src/db/meetings')
const { Tag } = require('../../../src/db/tags')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals, checkArraysEqual } = require('../../../utils/testUtils/dbTestUtils')

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })

beforeEach(async () => {
  await StudentProfile.deleteMany({})
  await GroupSchema.deleteMany({})
  await MeetingSchema.deleteMany({})
  await Tag.deleteMany({})
})

describe('Profile test suite', () => {
  test('should save new profile to database', async () => {
    const location = 'Wits'
    const coordinates = [28.0305, -26.1929] // longitude latitude for wits
    // hardcoded geolocation data which will become part of the form at some point
    const geodata = {
      type: 'Point',
      coordinates
    }
    const newProfile = new StudentProfile({
      email: 'newUser@gmail.com',
      firstName: 'Steve',
      lastName: 'Mojang',
      groups: [],
      location,
      geodata
    })

    const newSavedProfile = await newProfile.save()
    checkNotEmpty(newProfile)
    checkStringEquals(newProfile.email, newSavedProfile.email)
    checkStringEquals(newProfile.firstName, newSavedProfile.firstName)
    checkStringEquals(newProfile.lastName, newSavedProfile.lastName)
    checkStringEquals(newProfile.location, newSavedProfile.location)
    checkArraysEqual(newProfile.geodata.coordinates, newSavedProfile.geodata.coordinates)
    await StudentProfile.deleteMany({})
  })

  test('should retrieve profile from the database', async () => {
    const location = 'Wits'
    const coordinates = [28.0305, -26.1929] // longitude latitude for wits
    // hardcoded geolocation data which will become part of the form at some point
    const geodata = {
      type: 'Point',
      coordinates
    }
    const newProfile = new StudentProfile({
      email: 'retrieveUser@gmail.com',
      firstName: 'Jess',
      lastName: 'Spatula',
      groups: [],
      location,
      geodata
    })
    const newSavedProfile = await newProfile.save()
    const checkProfile = await StudentProfile.findOne({ email: newSavedProfile.email })
    checkNotEmpty(checkProfile)
    checkStringEquals(newSavedProfile.email, checkProfile.email)
    checkStringEquals(newSavedProfile.firstName, checkProfile.firstName)
    checkStringEquals(newSavedProfile.lastName, checkProfile.lastName)
    checkStringEquals(newSavedProfile.location, checkProfile.location)
    await StudentProfile.deleteMany({})
  })

  test('should update profile in the database', async () => {
    const location = 'Wits'
    const coordinates = [28.0305, -26.1929] // longitude latitude for wits
    // hardcoded geolocation data which will become part of the form at some point
    const geodata = {
      type: 'Point',
      coordinates
    }
    const newProfile = new StudentProfile({
      email: 'oldUser@gmail.com',
      firstName: 'Jess',
      lastName: 'Spatula',
      groups: [],
      location,
      geodata
    })
    const newEmail = 'updatedUser@gmail.com'
    const newSavedProfile = await newProfile.save()
    const checkProfile = await StudentProfile.findOneAndUpdate({ email: newSavedProfile.email }, { $set: { email: newEmail } }, { new: true })
    checkNotEmpty(checkProfile)
    checkStringEquals(checkProfile.email, newEmail)
    await StudentProfile.deleteMany({})
  })
  test('should calculate a students average rating', async () => {
    const ratings = [
      {
        rated: 4
      },
      {
        rated: 3
      },
      {
        rated: 2
      },
      {
        rated: 4
      },
      {
        rated: 5
      }

    ]
    const location = 'Wits'
    const coordinates = [28.0305, -26.1929] // longitude latitude for wits
    // hardcoded geolocation data which will become part of the form at some point
    const geodata = {
      type: 'Point',
      coordinates
    }
    const newProfile = new StudentProfile({
      email: 'oldUser@gmail.com',
      firstName: 'Jess',
      lastName: 'Spatula',
      groups: [],
      location,
      geodata,
      rating: ratings
    })
    await newProfile.save()
    const avg = newProfile.averageRating
    expect(avg).toBe(3.6)
    await StudentProfile.deleteMany({})
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

describe('Meetings test suite', () => {
  test('should save meeting to database', async () => {
    const group = new GroupSchema({
      name: 'Test Group'
    })
    const savedGroup = await group.save()
    const meeting = new MeetingSchema({
      name: 'Test Meeting',
      group: savedGroup._id,
      location: { type: 'Point', coordinates: [28.0473, 26.2041] }
    })
    const savedMeeting = await meeting.save()
    checkNotEmpty(savedMeeting)
    checkStringEquals(savedMeeting.name, meeting.name)
  })

  test('should find meeting in database', async () => {
    const group = new GroupSchema({
      name: 'Test Group'
    })
    const savedGroup = await group.save()
    const meeting = new MeetingSchema({
      name: 'Test Meeting',
      group: savedGroup._id,
      location: { type: 'Point', coordinates: [28.0473, 26.2041] }
    })
    const savedMeeting = await meeting.save()
    const checkMeeting = await MeetingSchema.findOne({ name: savedMeeting.name })
    checkNotEmpty(checkMeeting)
    checkStringEquals(checkMeeting.name, meeting.name)
  })

  test('should update meeting in the database', async () => {
    const group = new GroupSchema({
      name: 'Test Group'
    })
    const savedGroup = await group.save()
    const meeting = new MeetingSchema({
      name: 'New Test Meeting',
      group: savedGroup._id,
      location: { type: 'Point', coordinates: [28.0473, 26.2041] }
    })
    const updatedName = 'Updated Meeting Name'
    const updateCoords = [23.3645, 34.0575]
    const savedMeeting = await meeting.save()
    // lean option returns plain javascript object rather than mongoose document.
    const checkMeeting = await MeetingSchema.findOneAndUpdate(
      { _id: savedMeeting._id },
      { $set: { name: updatedName, location: { coordinates: updateCoords } } }, { new: true, lean: true })
    checkNotEmpty(checkMeeting)
    checkStringEquals(checkMeeting.name, updatedName)
    checkArraysEqual(checkMeeting.location.coordinates, updateCoords)
  })
})

describe('Tags test suite', () => {
  test('should save tag to database', async () => {
    const tag = new Tag({
      name: 'Test'
    })
    const savedTag = await tag.save()
    checkNotEmpty(savedTag)
  })
  test('should find tag in database', async () => {
    const tag = new Tag({
      name: 'Test'
    })
    await tag.save()
    const foundTag = await Tag.findOne({ name: 'Test' })
    checkNotEmpty(foundTag)
  })
  test('should update tag in database', async () => {
    const tag = new Tag({
      name: 'Test'
    })
    await tag.save()
    await Tag.updateOne({ name: 'Test' }, { name: 'Retest' })
    const tags = await Tag.find({})
    expect(tags.length).toEqual(1)
    expect(tags[0].name).toEqual('Retest')
  })
})
