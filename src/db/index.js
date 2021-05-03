const mongoose = require('mongoose')
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/cramjam'

// Create a new mongoose connection
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => {
    console.log('Database connected ✨')
  })
  .catch((err) => {
    console.error(console, 'connection error:', err)
  })

module.exports.db = mongoose.connection
