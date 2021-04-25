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
  },

  deleteMember: function (groupName, studentName) {
    const groupIndex = list.findIndex(item => item.name === groupName)
    const studentIndex = list[groupIndex].members.indexOf(studentName)
    list[groupIndex].members.splice(studentIndex, 1)
  }

}
