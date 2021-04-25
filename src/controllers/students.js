const students = [{
    email: "blake@email.com",
    firstName: "Blake",
    lastName: "Denham",
    password: "Awe"
}]

module.exports.add = (newStudent) => {
    students.push(newStudent)
}

module.exports.list = () => {
    return students
}