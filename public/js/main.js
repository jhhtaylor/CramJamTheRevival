(function () {
	"use strict";
    let the_rest = document.querySelector(".all");
    let header_navbar = document.querySelector(".navbar-area");

    window.onscroll = function () {
		let sticky = header_navbar.offsetTop;
        
		if (window.pageYOffset > sticky) {
			header_navbar.classList.add("sticky");
            the_rest.style.padding = `136px 0px 0px 0px`;
		} else {
			header_navbar.classList.remove("sticky");
            the_rest.style.padding = '';
		}
    }

})();