// Private
const groups = []
// Public
module.exports = {
  add: function (student) {
    groups.push(student)
  },
  edit: function (student, index) {
    groups[index] = student
  },
  get: function (index) {
    return groups[index]
  },
  delete: function (index) {
    groups.splice(index, 1) // remove one element starting from index
  }
}
