// temporary hard-coded items
module.exports.linkItems = [
  {
    // user: 'user1',
    // group: 'Group 1',
    name: 'Battery Low Voltage Alarm',
    url:
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO',
  },
  {
    // user: 'user2',
    // group: 'Group 2',
    name: 'Marxism',
    url:
      'https://is4-ssl.mzstatic.com/image/thumb/Purple124/v4/01/87/21/018721c6-551b-5d8d-1b74-bedaad367533/source/256x256bb.jpg',
  },
  {
    // user: 'user3',
    // group: 'Group 3',
    name: 'Radical Equations',
    url:
      'https://cdn.kastatic.org/ka-exercise-screenshots-2/xf46f88061126b980.png',
  }
]

module.exports.index = async (req, res) => {
  res.render('links/index', { linkItems: this.linkItems })
}
module.exports.createLink = async (req, res) => {
  const { name, url } = req.body
  const newLink = { name: name, url: url }
  this.linkItems.push(newLink)

  res.redirect('/links')
}

module.exports.renderNewForm = async (req, res) => {
  res.render('links/new.ejs')
}
