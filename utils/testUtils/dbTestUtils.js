const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const mongoServer = new MongoMemoryServer()

// Connect function for memory mongodb
module.exports.dbConnect = async () => {
  const uri = await mongoServer.getUri()

  const mongooseOpts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }

  await mongoose.connect(uri, mongooseOpts)
}

// Disconnect function for memory mongodb
module.exports.dbDisconnect = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}

// Helper function to check if an object is empty
module.exports.checkNotEmpty = (received) => {
  expect(received).not.toBeNull()
  expect(received).not.toBeUndefined()
  expect(received).toBeTruthy()
}

// Helper function to check if two strings are equal
module.exports.checkStringEquals = (received, expected) => {
  expect(received).toEqual(expected)
}
