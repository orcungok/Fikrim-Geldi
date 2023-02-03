document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const ilanTextDecider = () => {
    const ilanText = document.getElementById("no-ilan");

    if (ilanText == null) {
      const headerŞirket = document.getElementById("headerCompany");
      headerŞirket.style.display = "block";
    } else {
      ilanText.innerText == "Maalesef aradığınız kategoride proje bulunamadı";
    }
  };
  ilanTextDecider();

  const ilanSearcher = () => {
    /*========================İLAN ARAMA BAŞLANGIÇ=======================================*/

    function load_data(query = "") {
      fetch("/ilanlari_ara?search_query=" + query + "")
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
                `<a class="list-group-item list-group-item-action" onclick="get_text(this)">` +
                searchData[count].ilan_basligi.replace(
                  regular_expression,
                  '<span style="color:#C35353" class="fw-bold">$1</span>'
                ) +
                "</a>";
            }
          } else {
            html +=
              '<a href="#" class="list-group-item list-group-item-action disabled">İlan Bulunamadı</a>';
          }

          html += "</ul>";

          document.getElementById("search_result").innerHTML = html;
        });
    }

    var search_element = document.getElementById("autocomplete_search");

    search_element.onkeyup = function () {
      var query = search_element.value;

      load_data(query);
    };

    function get_text(event) {
      const ilan_basligi = event.textContent;

      console.log(ilan_ismi);

      document.getElementById("autocomplete_search").value = ilan_basligi;

      document.getElementById("search_result").innerHTML = "";
    }

    /*========================İLAN ARAMA BİTİŞ=======================================*/
  };

  ilanSearcher();
});
