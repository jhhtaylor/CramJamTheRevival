// Private
const list = [
  {
    name: 'Study Group 1',
    members: ['Tori', 'Blake', 'Duncan']
  }
]
// Public
module.exports = {
  add: function (student) {
    list.push(student)
  },
  list: function () {
    return list
  }
}
