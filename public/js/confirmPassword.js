const password = document.querySelector('#password')
const passwordConfirmation = document.querySelector('#passwordConfirmation')

const registerBtn = document.querySelector('#registerBtn')
const feedback = document.querySelector('#passwordFeedback')

password.addEventListener('change', checkPasswords)
passwordConfirmation.addEventListener('change', checkPasswords)

checkPasswords('')

function checkPasswords (e) {
  const isSame = (password.value === passwordConfirmation.value)
  registerBtn.disabled = !isSame
  feedback.innerHTML = isSame ? '' : 'Passwords Must Match.'
  if (isSame) passwordConfirmation.classList.remove('is-invalid')
  else passwordConfirmation.classList.add('is-invalid')
}
