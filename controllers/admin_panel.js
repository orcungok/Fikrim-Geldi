const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");
const { window } = new JSDOM("");
const DOMPurify = createDOMPurify(window);

const db_fg = require("../data/db_fg");

// const takim_arkadasi_ilanlari_db = require("../data/takim_arkadasi_ilanlari_db");

exports.getAdminPanelData = async (req, res) => {
  try {
    if (req.user && req.user.ROLE == "admin") {
      const { ID: user_id } = req.user;
      let sqlMain = "SELECT * FROM proje_detaylari";
      const [rawProjeler] = await db_fg.query(sqlMain);

      const sanitizedProjeler = rawProjeler.map(
        ({ proje_aciklamasi, proje_eklenme_tarihi, ...rest }) => {
          // Sanitize the HTML content using DOMPurify with the 'html' profile.
          const cleanHTMLAciklama = DOMPurify.sanitize(proje_aciklamasi, {
            USE_PROFILES: { html: true },
          });

          const dateObj = new Date(proje_eklenme_tarihi);
          const formattedDate = dateObj.toISOString().slice(0, 10);
          // console.log(formattedDate) ;
          return {
            ...rest,
            proje_aciklamasi: cleanHTMLAciklama,
            proje_eklenme_tarihi: formattedDate,
          };
        }
      );

      // let sql2 = "SELECT * FROM ta_ilanlari";
      // const allDB2 = await takim_arkadasi_ilanlari_db.query(sql2);
      // const takim_arkadasi_ilanlari = allDB2[0];
      res.render("dashboard", {
        projeler: sanitizedProjeler,
        // ilanlar: takim_arkadasi_ilanlari,
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
      .send(
        "<h1>Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyiniz</h1>"
      );
    console.log(error);
  }
};

exports.postFromAdminPanel = async (req, res) => {
  try {
    // console.log(req.body);

    if (Object.keys(req.body).includes("project_name")) {
      const {
        project_id,
        user_id,
        project_owner_email,
        project_owner_name,
        project_name,
        project_subject,
        project_category,
        project_sponsor,
        project_team_members,
        project_team_members_duty,
        project_explanation,
        project_image,
        project_file,
        project_date,
      } = req.body;

      console.log(req.body);

      const member_array = project_team_members.split(",");
      const member_duty_array = project_team_members_duty.split(",");

      const project_image_path = `/images/project_images/${project_image}`;

      const query = `INSERT INTO \`sql7605562\`.\`proje_detaylari_admin\` (\`user_id\`,\`email\`,\`projeyi_ekleyen\`,\`proje_ismi\`,\`proje_konusu\`,\`proje_kategorisi\`,\`proje_sponsoru\`,\`proje_takim_uyeleri\`, \`proje_takim_uyeleri_gorevleri\`,  \`proje_aciklamasi\`,\`proje_resmi_isim\`,\`proje_resmi_path\`, \`proje_dosyalari_url\`,\`proje_eklenme_tarihi\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        user_id,
        project_owner_email,
        project_owner_name,
        project_name,
        project_subject,
        project_category,
        project_sponsor,
        JSON.stringify(member_array),
        JSON.stringify(member_duty_array),
        project_explanation,
        project_image,
        project_image_path,
        project_file,
        project_date,
      ];
      await db_fg.query(query, values);

      const deleteSql = `DELETE FROM proje_detaylari WHERE id= ?`;
      await db_fg.query(deleteSql, [project_id]);
      // const result = await db_fg.query(deleteSql, [projectId]);
      // } else if (Object.keys(req.body).includes("annT_project_name")) {
      //   let form = req.body;
      //   //console.log(form);

      //   // let queryTaİlan =
      //   //   "INSERT INTO `takim_arkadasi_bul`.`ta_ilanlari_admin` (`user_id`,`email`,`ilani_ekleyen`,`ilan_basligi`,`ilan_aciklamasi`, `ilan_tarihi`, `ilan_projesi`,`ilan_sirketi`)" +
      //   //   `VALUES ('${form.user_id}','${form.annT_owner_email}','${form.annT_owner_name}','${form.annT_title}','${form.annT_explanation}','${form.annT_date}','${form.annT_project_name}','${form.annT_company_name}');`;
      //   // let ta_ilan = await takim_arkadasi_ilanlari_db.query(queryTaİlan);

      //   // let deleteSql = `DELETE FROM ta_ilanlari WHERE id= '${form.annT_id}'`;
      //   let result = await takim_arkadasi_ilanlari_db.query(deleteSql);
    }

    res.redirect("/anasayfa/admin");
  } catch (err) {
    console.log(err);
  }
};
