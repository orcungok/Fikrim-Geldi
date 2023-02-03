const projeler_db = require("../data/projeler_db");
const { promisify } = require("util");

exports.add_projects_ap = async (req, res) => {
  try {
    if (req.user) {
      let form = req.body;
      if (form.project_cito !== "Evet") {
        form.project_cito = "Hayır";
      }

      let email = req.user.EMAIL;
      let user_id = req.user.ID ; 
      let name = req.user.NAME;
      let surname = req.user.SURNAME;
      let fullName = name + " " + surname;

      const today = new Date();
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();

      if (dd < 10) dd = "0" + dd;
      if (mm < 10) mm = "0" + mm;

      let stringDate = dd + "/" + mm + "/" + yyyy;

      let arrayDate = stringDate.split("/");

      //console.log(arrayDate) ;

      let ayParametre = Number(arrayDate[1]) - 1;
      let date = new Date(arrayDate[2], ayParametre, arrayDate[0]); // 2009-11-10
      let month = date.toLocaleString("tr-TR", { month: "long" });
      let year = date.toLocaleString("tr-TR", { year: "numeric" });
      let day = date.toLocaleString("tr-TR", { day: "numeric" });

      const fullDate = `${day} ${month} ${year}`;

      let query =
        "INSERT INTO `projeler`.`proje_detaylari` (`user_id`,`email`,`projeyi_ekleyen`,`proje_ismi`,`proje_takim_uyeleri`,  `proje_kategorisi`, `proje_aciklamasi`,`proje_resmi_url`,`proje_dosyalari_url`,`cito_adayi`,`proje_eklenme_tarihi`)" +
        `VALUES (${user_id},'${email}','${fullName}','${form.project_name}','${form.project_team_members}','${form.project_category}', '${form.project_explanation}','${form.project_image}','${form.project_file}','${form.project_cito}','${fullDate}');`;

      let result = await projeler_db.query(query);

      res.status(202).render("tebrikler", { form });
    } else {
      res.status(401).redirect("/");
    }
  } catch (err) {
    res.status(404).render("error");
    console.log(err);
  }
};
