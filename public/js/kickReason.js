const kickForms = document.querySelectorAll('.removeForm')
const reasonBtn = document.querySelector('#kickBtn')
const cancelBtn = document.querySelector('#cancel')
const reason = document.querySelector('#kickReason')
const removeModal = document.querySelector('#remove')

let currentForm

reasonBtn.addEventListener('click', () => {
  const val = reason.options[reason.selectedIndex].value
  submitForm(val)
})

document.querySelector('#remove .close').addEventListener('click', function () {
  removeModal.style.display = 'none'
})

function submitForm (val) {
  const kickForm = currentForm
  console.log(val)
  const myin = document.createElement('input')
  myin.type = 'hidden'
  myin.name = 'reason'
  myin.value = val
  kickForm.appendChild(myin)
  kickForm.submit()
}

cancelBtn.addEventListener('click', function () {
  removeModal.style.display = 'none'
})

for (const kickForm of kickForms) {
  if (kickForm.attachEvent) {
    kickForm.attachEvent('submit', processForm)
  } else {
    kickForm.addEventListener('submit', processForm)
  }
}

function processForm (e) {
  if (e.preventDefault) e.preventDefault()
  removeModal.style.display = 'flex'
  currentForm = e.target
  return false
}
