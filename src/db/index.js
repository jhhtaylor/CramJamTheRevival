const mongoose = require('mongoose')

// Create a new mongoose connection
mongoose.connect('mongodb://localhost/cramjam', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Database connected ✨')
  })
  .catch((err) => {
    console.error(console, 'connection error:', err)
  })

module.exports.db = mongoose.connection
