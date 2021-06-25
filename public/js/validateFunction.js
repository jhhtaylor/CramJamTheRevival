function validateField (field, validateArr) {
  const val = field.value
  const isUnique = validateArr.every((e) => {
	  return e !== val
  })
  register.disabled = !isUnique
  if (isUnique) {
	  field.classList.remove('is-invalid')
	  field.classList.add('is-valid')
  } else {
	  field.classList.add('is-invalid')
	  field.classList.remove('is-valid')
  }
}
