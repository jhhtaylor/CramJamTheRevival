const toastElList = [].slice.call(document.querySelectorAll('.toast'))
const toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl, { duration: 5000 }) // bootstrap is defined by the script tag in flash.ejs
})
toastList.forEach(toast => toast.show())
