// Private
const list = [
  {
    name: 'Study Group 1',
    members: ['Tori', 'Blake', 'Duncan']
  },
  {
    name: 'Study Group 2',
    members: ['Jon', 'Josh', 'Jess']
  }

]
// Public
module.exports = {
  add: function (name) {
    const newGroup = { name: name, members: [] }
    list.push(newGroup)
  },
  list: function () {
    return list
  }

}
