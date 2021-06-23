const processScroll = () => {
  const amount = document.getElementById('progress-bar').innerHTML
  const scrollPercent = amount / 10 * 100 + '%'

  // console.log(scrollTop + ' / ' + scrollBottom + ' / ' + scrollPercent);

  document.getElementById('progress-bar').style.setProperty('--scrollAmount', scrollPercent)
}

document.addEventListener('DOMContentLoaded', processScroll);

(function () {
  'use strict'
  const the_rest = document.querySelector('.all')
  const header_navbar = document.querySelector('.navbar-area')

  window.onscroll = function () {
    const sticky = header_navbar.offsetTop

    if (window.pageYOffset > sticky) {
      header_navbar.classList.add('sticky')
      the_rest.style.padding = '136px 0px 0px 0px'
    } else {
      header_navbar.classList.remove('sticky')
      the_rest.style.padding = ''
    }
  }

  if ('geolocation' in navigator) {
    console.log('available')
    navigator.geolocation.watchPosition((position) => {
		  console.log(position.coords.latitude)
		  console.log(position.coords.longitude)
		  console.log(position)
    })
	  } else {
    console.log('not available')
	  }
})()
