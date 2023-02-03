const projeler_db = require("../data/projeler_db");
const takim_arkadasi_ilanlari_db = require("../data/takim_arkadasi_ilanlari_db");

exports.getAdminPanelData = async (req, res) => {
  try {
    if (req.user && req.user.ROLE == "admin") {
      let user_id = req.user.ID;
      //console.log(user_id)
      let sql1 = "SELECT * FROM proje_detaylari";
      const allDB1 = await projeler_db.query(sql1);
      const projeler = allDB1[0];

      let sql2 = "SELECT * FROM ta_ilanlari";
      const allDB2 = await takim_arkadasi_ilanlari_db.query(sql2);
      const takim_arkadasi_ilanlari = allDB2[0];
      res.render("dashboard", {
        projeler: projeler,
        ilanlar: takim_arkadasi_ilanlari,
        user_id,
      });
    } else {
      res
        .status(401)
        .send("<h1>Üzgünüz, bu sayfaya erişim izniniz bulunmamaktadır.</h1>");
    }
  } catch (error) {
    res
    .status(401)
    .send("<h1>Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyiniz</h1>");
    console.log(error);
  }
};

exports.postFromAdminPanel = async (req, res) => {
  try {
    //console.log(req.body) ;

    if (Object.keys(req.body).includes("project_name")) {
      let form = req.body;
      //console.log(form)

      let queryProjeler =
        "INSERT INTO `projeler`.`proje_detaylari_admin` (`user_id`,`email`,`projeyi_ekleyen`,`proje_ismi`,`proje_takim_uyeleri`, `proje_kategorisi`, `proje_aciklamasi`,`proje_resmi_url`,`proje_dosyalari_url`,`cito_adayi`,`proje_eklenme_tarihi`)" +
        `VALUES ('${form.user_id}','${form.project_owner_email}','${form.project_owner_name}','${form.project_name}','${form.project_team_members}','${form.project_category}', '${form.project_explanation}','${form.project_image}','${form.project_file}','${form.project_cito}','${form.project_date}');`;

      let proje = await projeler_db.query(queryProjeler);

      let deleteSql = `DELETE FROM proje_detaylari WHERE id= '${form.project_id}'`;
      let result = await projeler_db.query(deleteSql);
    } else if (Object.keys(req.body).includes("annT_project_name")) {
      let form = req.body;
      //console.log(form);

      let queryTaİlan =
        "INSERT INTO `takim_arkadasi_bul`.`ta_ilanlari_admin` (`user_id`,`email`,`ilani_ekleyen`,`ilan_basligi`,`ilan_aciklamasi`, `ilan_tarihi`, `ilan_projesi`,`ilan_sirketi`)" +
        `VALUES ('${form.user_id}','${form.annT_owner_email}','${form.annT_owner_name}','${form.annT_title}','${form.annT_explanation}','${form.annT_date}','${form.annT_project_name}','${form.annT_company_name}');`;
      let ta_ilan = await takim_arkadasi_ilanlari_db.query(queryTaİlan);

      let deleteSql = `DELETE FROM ta_ilanlari WHERE id= '${form.annT_id}'`;
      let result = await takim_arkadasi_ilanlari_db.query(deleteSql);
    }

    res.redirect("/anasayfa/admin");
  } catch (err) {
    console.log(err);
  }
};
