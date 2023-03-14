document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const headerTextDecider = () => {
    const projectText = document.getElementById("empty");
    if (projectText) {
      let inner = projectText.innerText;
      if (inner.includes("Maalesef")) {
        document.getElementById("tumProjeler").style.display = "none";
      }
    }
  };
  headerTextDecider();

  const projectExArranger = () => {
    const proje_aciklamasi = document.getElementsByClassName("intro");
    for (let index = 0; index < proje_aciklamasi.length; index++) {
      proje_aciklamasi[index].innerHTML = `${proje_aciklamasi[
        index
      ].innerHTML.slice(0, 200)}<span class="dots">...</span`;
    }
  };
  projectExArranger();

  const projectSearcher = () => {
    const toggleButton = document.querySelector(
      'button[data-bs-target="#search_result"]'
    );
    toggleButton.style.display = "none";

    /*========================PROJE ARAMA BAŞLANGIÇ=======================================*/

    function load_data(query = "") {
      fetch("/projeleri_ara?search_query=" + query + "")
        .then(function (response) {
          return response.json();
        })
        .then(function (responseData) {
          const searchData = responseData[0];

          toggleButton.style.display = "block";

          let html =
            '<div class="d-flex justify-content-center align-items-center"><ul class="list-inline bigger-buttons">';

          if (searchData.length > 0) {
            //console.log(searchData);

            for (var count = 0; count < searchData.length; count++) {
              let regular_expression = new RegExp("(" + query + ")");

              html +=
                `<li class="list-inline-item"><a href="/projeler/${searchData[count].id}" onclick="get_text(this)">` +
                searchData[count].proje_ismi +
                `</a></li>`;
            }
          } else {
            html +=
              '<h4 class="animate__animated animate__flipInY"><a href="#" class="list-group-item list-group-item-action disabled fw-bold">Aramış Olduğunuz Proje Bulunamadı  <i class="fa-solid fa-face-sad-tear"></i></a></h4>';
          }

          html += `</ul></div>`;

          document.getElementById("search_result").innerHTML = html;
        });
    }

    const search_element = document.getElementById("autocomplete_search");

    search_element.onkeyup = function () {
      let query = search_element.value;
      load_data(query);
    };

    /*========================PROJE ARAMA BİTİŞ=======================================*/
  };
  projectSearcher();

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

  const carouselTextEditer = () => {
    const paragraph = document.getElementsByClassName("project-text-carousel");
    for (let index = 0; index < paragraph.length; index++) {
      const length = 250;
      const text = paragraph[index].innerText;
      const truncatedText = text.substring(0, length) + "...";
      paragraph[index].innerText = truncatedText;
    }
  };

  carouselTextEditer();

  const confettiMachine = () => {
    const mainHeader = document.getElementById("party-time");
    mainHeader.addEventListener("click", () => {
      const jsConfetti = new JSConfetti();
      jsConfetti.addConfetti({
        emojis: ["📔", "📕", "📗", "📘", "📚", "📒"],
      });
    });
  };
  confettiMachine();

  const bigHeaderCategory = () => {
    const headerKategori = document.getElementById("headerKategori");

    if (headerKategori) {
      let kategori = headerKategori.innerText;
      switch (kategori) {
        case "uretim PROJELERİ":
          headerKategori.innerText = "ÜRETİM PROJELERİ";
          break;

        case "hizmet PROJELERİ":
          headerKategori.innerText = "HİZMET PROJELERİ";
          break;

        case "kurumsal sosyal sorumluluk PROJELERİ":
          headerKategori.innerText = "KURUMSAL SOSYAL SORUMLULUK PROJELERİ";
          break;

        case "arge PROJELERİ":
          headerKategori.innerText = "ARGE PROJELERİ";
          break;

        default:
          break;
      }
    }
  };
  bigHeaderCategory();

  const cardPaginator = () => {
    const paginationContainer = $("#pagination-container");

    const cards = Array.from(document.querySelectorAll(".pagination-wrapper"));
    // console.log(cards)

    paginationContainer.pagination({
      dataSource: cards, // your array of data to paginate
      pageSize: 6, // number of items per page
      callback: function (data, pagination) {
        // render your cards here
        // you can access the current page number using pagination.pageNumber

        let pageNumber = pagination.pageNumber;

        const cardContainer = $("#card-container"); // cardları tutan row, card-container olarak geçiyor.
        cardContainer.empty(); // clear previous cards (node.js ile daha önce derlenmiş kartları ilk önce temizle)

        data.forEach((card) => {
          const cardHtml = Handlebars.compile(card.innerHTML);
          cardContainer.append(cardHtml);
        });

        //aktif sayfayı belirleyen kod bloğu
        const paginationListItems = document.querySelectorAll(
          "#pagination-container li"
        );
        paginationListItems.forEach((listItem) => {
          listItem.addEventListener("click", function () {
            const targetElement = document.getElementById("kutuphane");
            targetElement.scrollIntoView({ behavior: "smooth" });
          });
        });

        const paginationLinks = document.querySelectorAll(
          "#pagination-container li a"
        );

        //iki diziyi bir arada kullanabilmek için traditional for kullandım
        for (let i = 0; i < paginationLinks.length; i++) {
          if (Number(paginationLinks[i].innerHTML) === pageNumber) {
            paginationListItems[i].style.backgroundColor = "black";
          }
        }
      },
    });
  };

  cardPaginator();

  const showFilterInfo = () => {
    const infoCategory = document.getElementById("info-category");
    const infoRange = document.getElementById("info-range");
    const infoSort = document.getElementById("info-sort");

    if (infoCategory) {
      let category = infoCategory.innerText;
      switch (category) {
        case "arge":
          infoCategory.innerText = "Arge";
          break;

        case "kurumsal sosyal sorumluluk":
          infoCategory.innerText = "Kurumsal Sosyal Sorumluluk";
          break;

        case "hizmet":
          infoCategory.innerText = "Hizmet";
          break;

        case "uretim":
          infoCategory.innerText = "Üretim";
          break;

        default:
          break;
      }
    }

    if (infoRange) {
      let range = infoRange.innerText;
      switch (range) {
        case "bugun":
          infoRange.innerText = "bugün";
          break;

        case "bu_hafta":
          infoRange.innerText = "bu hafta";
          break;

        case "bu_ay":
          infoRange.innerText = "bu ay";
          break;

        case "bu_yil":
          infoRange.innerText = "bu yıl";
          break;

        default:
          break;
      }
    }

    if (infoSort) {
      let sort = infoSort.innerText;
      switch (sort) {
        case "proje_goruntulenme_sayisi":
          infoSort.innerText = "En Çok Görüntülenenler";
          break;

        case "proje_eklenme_tarihi":
          infoSort.innerText = "En Son Eklenilenler";
          break;

        default:
          break;
      }
    }
  };

  showFilterInfo();

  const searchProjectsBtnHover = () => {

    const fixedButton = document.querySelector(".fixed-button");

    fixedButton.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i>' ;
  
    fixedButton.addEventListener("mouseenter", function () {
      this.innerHTML = "Proje Ara";
      this.classList.remove("closed");
      this.classList.add("expanded");
    });
  
    fixedButton.addEventListener("mouseleave", function () {
      this.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i>';
      this.classList.remove("expanded");
      this.classList.add("closed");
    });
  
    fixedButton.addEventListener("touchstart", function () {
      this.innerHTML = "Proje Ara";
      this.classList.remove("closed");
      this.classList.add("expanded");
    });
  
    fixedButton.addEventListener("touchend", function () {
      this.innerHTML = "+";
      this.classList.remove("expanded");
      this.classList.add("closed");
    });

  }
  searchProjectsBtnHover() ;


});
