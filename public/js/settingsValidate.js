let allEmails = allStudents.map((e) => {
  return e.email
})

let allUsernames = allStudents.map((e) => {
  return e.username
})

allEmails = allEmails.filter(e => { return e !== signedInUser.email }) // remove the users current email from list
allUsernames = allUsernames.filter(e => { return e !== signedInUser.username }) // remove the users current username from list

const save = document.querySelector('#save')

const username = document.querySelector('#userName')
const email = document.querySelector('#email')

username.addEventListener('change', validUsername)
email.addEventListener('change', validEmail)

function validUsername (e) {
  validateField(username, allUsernames)
}

function validEmail (e) {
  validateField(email, allEmails)
}

function validateField (field, validateArr) {
  const val = field.value
  const isUnique = validateArr.every((e) => {
    return e !== val
  })
  save.disabled = !isUnique
  if (isUnique) {
    field.classList.remove('is-invalid')
    field.classList.add('is-valid')
  } else {
    field.classList.add('is-invalid')
    field.classList.remove('is-valid')
  }
}
