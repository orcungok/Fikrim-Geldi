const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");
const { window } = new JSDOM("");
const DOMPurify = createDOMPurify(window);

const db_fg = require("../data/db_fg");


exports.getAdminPanelData = async (req, res) => {
  try {
    if (req.user && req.user.role == "admin") {
      const { id: user_id } = req.user;
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

    
      res.render("dashboard", {
        projeler: sanitizedProjeler,
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

      const query = `INSERT INTO \`projeler\`.\`proje_detaylari_admin\` (\`user_id\`,\`email\`,\`projeyi_ekleyen\`,\`proje_ismi\`,\`proje_konusu\`,\`proje_kategorisi\`,\`proje_sponsoru\`,\`proje_takim_uyeleri\`, \`proje_takim_uyeleri_gorevleri\`,  \`proje_aciklamasi\`,\`proje_resmi_isim\`,\`proje_resmi_path\`, \`proje_dosyalari_url\`,\`proje_eklenme_tarihi\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
    res.redirect("/anasayfa/admin");
  } catch (err) {
    console.log(err);
  }
};
