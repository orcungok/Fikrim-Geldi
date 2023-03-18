document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
  }

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector(".scroll-top");
  if (scrollTop) {
    const togglescrollTop = function () {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
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
  const table = document.getElementById("table");
  const tbody = table.querySelector("tbody");
  const addBtn = document.getElementById("add");
  const infoHeader = document.getElementById("add-members-info");

  function addRow() {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const nameInput = document.createElement("textarea");
    nameInput.setAttribute("name", "project_team_members");
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);

    const dutyCell = document.createElement("td");
    const dutyInput = document.createElement("textarea");
    dutyInput.setAttribute("name", "project_team_members_duty");
    dutyCell.appendChild(dutyInput);
    row.appendChild(dutyCell);

    const actionCell = document.createElement("td");
    actionCell.setAttribute(
      "style",
      "text-align: center; vertical-align: middle;"
    );
    const removeBtn = document.createElement("button");
    removeBtn.setAttribute("type", "button");
    removeBtn.setAttribute("class", "remove");

    removeBtn.innerText = "Üyeyi Çıkar";
    actionCell.appendChild(removeBtn);
    row.appendChild(actionCell);

    tbody.appendChild(row);
    // Show the table header if it was previously hidden
    table.querySelector("thead").style.display = "";
  }

  function removeRow(event) {
    const button = event.target;
    const row = button.closest("tr");
    row.parentNode.removeChild(row);
    // Hide the table header if there are no rows in the table body
    if (tbody.children.length === 0) {
      table.querySelector("thead").style.display = "none";
    }
  }

  addBtn.addEventListener("click", addRow);

  table.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove")) {
      removeRow(event);
    }
  });

  // Initialize the Quill editor
  const quill = new Quill("#editor", {

    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'align': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'color': [] }],
        ['image', 'link'],
        ['clean']
      ]
    },
    theme: "snow",
    placeholder: "Proje Kütüphanesine eklenecek olan projenizin içeriğini oluşturun. (Bu içerik, projenize özel olarak oluşturulmuş sayfaya, buradaki içerik ile aynı formatta eklenmektedir.) Proje kapak görselinin yanı sıra projeye ait başka görseller de ekleyebilir veya herhangi bir siteye link yönlendirmesi yapabilirsiniz.",
  });

  document
    .querySelector("#project_form")
    .addEventListener("submit", function () {
      const editorContent = document.querySelector("#editor .ql-editor").innerHTML;

      const wrappedContent = `<div class="main-content-explanation">${editorContent}</div>`;
      

      document.querySelector("#project_explanation").value = wrappedContent;
    });
});
