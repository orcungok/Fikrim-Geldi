const projeler_db = require("../data/db_fg");
const { JSDOM } = require("jsdom");
const iconv = require('iconv-lite');

exports.getAdminApprovedProjects = async (req, res) => {
  try {
    if (req.user) {
      //kullanıcı giriş yapmışsa
      let user_id = req.user.ID;
      let sqlMain = "SELECT * FROM proje_detaylari_admin";
      const allDB = await projeler_db.query(sqlMain);
      const projeler = allDB[0]; //veritabanındaki projeleri ata
      let length = projeler.length;
      let email = req.user.EMAIL;

      if (projeler.length > 0) {
        //veritabanında proje mevcutsa
        const filters = req.query; //
        const category = filters.proje_kategorisi; // kss, hizmet, üretim , arge
        const sortBy = filters.siralama; // en çok goruntulenen, en cok begenilen ...
        const range = filters.aralik; // bugün , bu hafta , bu ay , bu yıl

        const pickProjects = (projeler) => {
          let pickedProjects = [];
          while (pickedProjects.length < 3) {
            let randomIndex = Math.floor(Math.random() * projeler.length);
            let randomProject = projeler[randomIndex];
            if (!pickedProjects.includes(randomProject)) {
              pickedProjects.push(randomProject);
            }
          }
          return pickedProjects;
        };
        let randomProjeler = pickProjects(projeler);

        const projectFormatter = (projeler) => {
          //veritabanından gelen işlenmemiş bazı proje verilerini işler. Örneğin tarih vb.
          projeler.forEach((proje) => {
            const dateString = proje.proje_eklenme_tarihi;
            const date = new Date(dateString);

            const options = { day: "numeric", month: "long", year: "numeric" };
            const formattedDate = date.toLocaleDateString("tr-TR", options);
            proje.proje_eklenme_tarihi = formattedDate;
          });

          return projeler;
        };

        if (category) {
          let rangeRemover = "";
          let sql = `SELECT * FROM proje_detaylari_admin WHERE proje_kategorisi='${category}'`;
          let urlStringSortBy = `?proje_kategorisi=${category}&siralama=`;
          let urlStringRange = `?proje_kategorisi=${category}&aralik=`;

          if (sortBy === "proje_goruntulenme_sayisi") {
            sql += ` ORDER BY ${sortBy} DESC`;
            rangeRemover += "removeRange";
          } else if (sortBy === "proje_eklenme_tarihi") {
            sql += ` ORDER BY ${sortBy} DESC`;
            rangeRemover += "removeRange";
          }

          if (range === "bugun") {
            sql += ` AND proje_eklenme_tarihi = CURDATE()`;
          } else if (range === "bu_hafta") {
            sql += `AND proje_eklenme_tarihi BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW();`;
          } else if (range === "bu_ay") {
            sql += `AND MONTH(proje_eklenme_tarihi) = MONTH(NOW()) AND YEAR(proje_eklenme_tarihi) = YEAR(NOW());`;
          } else if (range == "bu_yil") {
            sql += `AND YEAR(proje_eklenme_tarihi) = YEAR(NOW());`;
          }

          const [rawProjectData, attributes] = await projeler_db.execute(sql);
          const length = rawProjectData.length;
          // console.log(sql);
          // console.log(rawProjectData);

          let projeler = projectFormatter(rawProjectData);

          res.render("proje_kütüphanesi", {
            projeler,
            randomProjeler: randomProjeler,

            urlStringSortBy,
            urlStringRange,
            category,
            length,
            rangeRemover,
            range,
            sortBy,
          });
        } else if (sortBy) {
          let rangeRemover = "removeRange";
          let sql = `SELECT * FROM proje_detaylari_admin`;
          let urlStringSortBy = `?siralama=`;

          let urlStringSpecial = `&siralama=${sortBy}`;

          if (sortBy == "proje_goruntulenme_sayisi") {
            sql += ` ORDER BY ${sortBy} DESC`;
          } else if (sortBy == "proje_eklenme_tarihi") {
            sql += ` ORDER BY ${sortBy} DESC`;
          }

          const [rawProjectData, attributes] = await projeler_db.execute(sql);
          const length = rawProjectData.length;

          let projeler = projectFormatter(rawProjectData);

          res.render("proje_kütüphanesi", {
            projeler,
            randomProjeler: randomProjeler,
            sortBy,
            length,
            rangeRemover,
            urlStringSortBy,
            urlStringSpecial,
          });
        } else if (range) {
          let sql = `SELECT * FROM proje_detaylari_admin`;
          let urlStringRange = `?aralik=`;
          let urlStringSortBy = `?siralama=`;

          if (range === "bugun") {
            sql += ` WHERE proje_eklenme_tarihi = CURDATE()`; //bugün eklenen projeleri döndür.
          } else if (range === "bu_hafta") {
            sql += ` WHERE YEARWEEK(proje_eklenme_tarihi, 1) = YEARWEEK(NOW(), 1);`;
          } else if (range == "bu_ay") {
            sql += ` WHERE MONTH(proje_eklenme_tarihi) = MONTH(NOW()) AND YEAR(proje_eklenme_tarihi) = YEAR(NOW());`;
          } else if (range == "bu_yil") {
            sql += ` WHERE YEAR(proje_eklenme_tarihi) = YEAR(NOW());`;
          }

          const [rawProjectData, attributes] = await projeler_db.execute(sql);
          const length = rawProjectData.length;

          let projeler = projectFormatter(rawProjectData);

          res.render("proje_kütüphanesi", {
            projeler,
            randomProjeler: randomProjeler,

            urlStringRange,
            urlStringSortBy,
            length,
            range,
          });
        } else {
          let formattedProjeler = projectFormatter(projeler);
          let urlStringSortBy = `?siralama=`;
          let urlStringRange = `?aralik=`;

          return res.render("proje_kütüphanesi", {
            projeler: formattedProjeler,
            randomProjeler: randomProjeler,
            length,
            email,
            user_id,
            urlStringSortBy,
            urlStringRange,
          });
        }
      } else {
        //kütüphanede proje mevcut değilse sadece kullanıcı bilgilerini gönder.
        let user_id = req.user.ID;
        let email = req.user.EMAIL;
        return res.render("proje_kütüphanesi", { email, user_id });
      }
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.projects_search = async (req, res) => {
  try {
    if (req.user) {
      const search_query = req.query.search_query;
      //console.log(search_query) ;

      let query = `
          SELECT * FROM proje_detaylari_admin 
          WHERE proje_ismi LIKE '%${search_query}%' 
          LIMIT 10
          `;

      const data = await projeler_db.query(query);
      //console.log(data);

      res.json(data);
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getProjectBlog = async (req, res) => {
  try {
    if (req.user) {
      let proje_id = req.params.proje_id;
      let user_email = req.user.EMAIL;
      let user_id = req.user.ID;

      const allDb = await projeler_db.query(
        `select * from proje_detaylari_admin where id='${proje_id}'`
      );

      const update = await projeler_db.query(
        `update proje_detaylari_admin set proje_goruntulenme_sayisi=proje_goruntulenme_sayisi+1 where id='${proje_id}'`
      );

      const unique_proje = allDb[0];

      // console.log(unique_proje);

      if (unique_proje.length > 0) {
        //Her bir projenin eklenme tarihini okunabilir bir biçime getirmek için formatladım

        unique_proje.forEach((proje) => {
          const dom = new JSDOM(proje.proje_aciklamasi);

          // Render the DOM content on a web page
          const renderedContent = dom.window.document.querySelector(
            ".main-content-explanation"
          ).innerHTML;
          proje.proje_aciklamasi = renderedContent;

          const dateString = proje.proje_eklenme_tarihi;
          const date = new Date(dateString);

          const options = { day: "numeric", month: "long", year: "numeric" };
          const formattedDate = date.toLocaleDateString("tr-TR", options);
          proje.proje_eklenme_tarihi = formattedDate;

          proje.proje_takim_uyeleri = JSON.parse(proje.proje_takim_uyeleri);
          proje.proje_takim_uyeleri_gorevleri = JSON.parse(
            proje.proje_takim_uyeleri_gorevleri
          );
        });

        const proje = await projeler_db.query(
          `select * from proje_detaylari_admin where email=?`,
          [unique_proje[0].email]
        ); //proje iki elemanlı uzun bir dizi , proje[0] içinde tek bir obje olan bir dizi , proje[0][0] objenin kendisi

        let sirket = proje[0][0].COMPANY;
        let departman = proje[0][0].DEPARTMENT;
        unique_proje[0].sirket = sirket;
        unique_proje[0].departman = departman;

        const unique = unique_proje[0];

        res.render("proje_blog", {
          unique,
          user_email,
          user_id,
        });
      } else {
        res.render("error");
      }
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.add_projects_ap = async (req, res) => {
  try {
    if (req.user) {
      let form = req.body;
      // console.log(form);
      let email = req.user.EMAIL;
      let user_id = req.user.ID;
      let name = req.user.NAME;
      let surname = req.user.SURNAME;
      let fullName = name + " " + surname;

      // console.log(req.file) ;
      // console.log(req.file.originalname) ;


      // const encodedFileName = req.file.originalname;
      // const decodedFileName = iconv.decode(Buffer.from(encodedFileName, "binary"), "utf-8");


      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const day = today.getDate().toString().padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`; //yyyy-mm-dd

      //console.log(formattedDate) ;

      let query =
        "INSERT INTO `sql7605562`.`proje_detaylari` (`user_id`,`email`,`projeyi_ekleyen`,`proje_ismi`,`proje_konusu`,`proje_kategorisi`,`proje_sponsoru`,`proje_takim_uyeleri`, `proje_takim_uyeleri_gorevleri`,  `proje_aciklamasi`,`proje_resmi_url`,`proje_dosyalari_url`,`proje_eklenme_tarihi`)" +
        `VALUES (${user_id},'${email}','${fullName}','${form.project_name}','${form.project_subject}','${form.project_category}','${form.project_sponsor}','${form.project_team_members}','${form.project_team_members_duty}','${form.project_explanation}','${form.project_image}','${form.project_file}','${formattedDate}');`;

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
