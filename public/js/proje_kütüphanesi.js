document.addEventListener("DOMContentLoaded", () => {
  const headerTextDecider = () => {
    const projectText = document.getElementById("no-projects");

    if (projectText == null) {
      const headerKategori = document.getElementById("headerKategori");
      headerKategori.style.display = "block";
    } else {
      projectText.innerText ==
        "Maalesef aradığınız kategoride proje bulunamadı";
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
    /*========================PROJE ARAMA BAŞLANGIÇ=======================================*/

    function load_data(query = "") {
      fetch("/projeleri_ara?search_query=" + query + "")
        .then(function (response) {
          return response.json();
        })
        .then(function (responseData) {
          const searchData = responseData[0];
          var html = '<ul class="list-group">';

          if (searchData.length > 0) {
            //console.log(searchData);

            for (var count = 0; count < searchData.length; count++) {
              var regular_expression = new RegExp("(" + query + ")");

              html +=
                `<a href="/projeler/${searchData[count].id}" class="list-group-item list-group-item-action" onclick="get_text(this)">` +
                searchData[count].proje_ismi.replace(
                  regular_expression,
                  '<span style="color:#C35353" class="fw-bold">$1</span>'
                ) +
                "</a>";
            }
          } else {
            html +=
              '<a href="#" class="list-group-item list-group-item-action disabled">Proje Bulunamadı</a>';
          }

          html += "</ul>";

          document.getElementById("search_result").innerHTML = html;
        });
    }

    const search_element = document.getElementById("autocomplete_search");

    search_element.onkeyup = function () {
      var query = search_element.value;

      load_data(query);
    };

    function get_text(event) {
      var proje_ismi = event.textContent;

      console.log(proje_ismi);

      document.getElementById("autocomplete_search").value = proje_ismi;

      document.getElementById("search_result").innerHTML = "";
    }

    /*========================PROJE ARAMA BİTİŞ=======================================*/
  };
  projectSearcher();
});

const postcardAnimationDecider = () => {
  /*========================POSTCARD ANIMATION DIRECTION START=======================================*/

  const postcards = Array.prototype.slice.call(
    document.getElementsByClassName("postcard")
  );
  //console.log(postcards) ;

  for (let index = 0; index < postcards.length; index++) {
    if (index % 2 == 0) {
      postcards[index].style.flexDirection = "row";
      postcards[index].setAttribute("data-aos", "slide-right");
      postcards[index].setAttribute("data-aos-duration", "1000");
    } else {
      postcards[index].style.flexDirection = "row-reverse";

      postcards[index].setAttribute("data-aos", "slide-left");
      postcards[index].setAttribute("data-aos-duration", "1000");
    }
  }

  /*========================POSTCARD ANIMATION DIRECTION END=======================================*/
};
postcardAnimationDecider();
