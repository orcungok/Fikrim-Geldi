document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const scrollToTopArrow = () => {
    const scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) {
      const togglescrollTop = function () {
        if (
          //eğer kullanıcı sayfanın sonuna gelmişse scroll top top butonunu gösterir.
          window.innerHeight + window.pageYOffset >=
          document.body.offsetHeight
        ) {
          scrollTop.classList.add("active");
        } else {
          scrollTop.classList.remove("active");
        }
      };
      window.addEventListener("load", togglescrollTop);
      document.addEventListener("scroll", togglescrollTop);
      scrollTop.addEventListener(
        "click",
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      );
    }
  };
  scrollToTopArrow();


});
