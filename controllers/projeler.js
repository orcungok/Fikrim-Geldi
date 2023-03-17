const db_fg = require("../data/db_fg");
const { JSDOM } = require("jsdom");
// const iconv = require("iconv-lite");

exports.getAdminApprovedProjects = async (req, res) => {
  try {
    if (req.user) {
      const sqlMain = "SELECT * FROM proje_detaylari_admin";
      const [allDB] = await db_fg.query(sqlMain);
      const projeler = allDB || []; // veritabanındaki projeleri ata veya boş dizi olarak ata
      const length = projeler.length;
      const email = req.user.EMAIL;
      let user_id = req?.user?.ID; // Check if the req object has a 'user' property and if it does, get its 'ID' property
      if (!user_id) throw new Error("Kullanıcı ID'si bulunamadı");
      if (projeler.length > 0) {
        //veritabanında proje mevcutsa
        const {
          proje_kategorisi: category,
          siralama: sortBy,
          aralik: range,
        } = req.query;

        const pickProjects = (projeler) => {
          const pickedProjects = [],
            remainingProjects = [...projeler];

          while (pickedProjects.length < Math.min(3, projeler.length)) {
            const randomIndex = Math.floor(
              Math.random() * remainingProjects.length
            );
            const randomProject = remainingProjects.splice(randomIndex, 1)[0];
            pickedProjects.push(randomProject);
          }

          return pickedProjects;
        };

        let randomProjeler = pickProjects(projeler);

        const projectFormatter = (projeler) => {
          // formats unprocessed project data from the database such as date info etc.
          return projeler.map((proje) => {
            const dateString = proje.proje_eklenme_tarihi;
            const date = new Date(dateString);

            const options = { day: "numeric", month: "long", year: "numeric" };
            const formattedDate = date.toLocaleDateString("tr-TR", options);
            return { ...proje, proje_eklenme_tarihi: formattedDate };
          });
        };

        //filtreleme başlangıç -------------------------------------
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

          const [rawProjectData] = await db_fg.execute(sql);
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

          const [rawProjectData, attributes] = await db_fg.execute(sql);
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

          const [rawProjectData, attributes] = await db_fg.execute(sql);
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

        //filtreleme bitiş--------------------------------------------
      } else {
        //kütüphanede proje mevcut değilse sadece kullanıcı bilgilerini gönder.
        const { ID: user_id, EMAIL: email } = req.user;
        return res.render("proje_kütüphanesi", {
          email,
          user_id,
          msgNoProjects: "Maalesef henüz kütüphaneye hiçbir proje eklenmemiş.",
        });
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

      const data = await db_fg.query(query);
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
      const { EMAIL: user_email, ID: user_id } = req.user;
      const proje_id = req.params.proje_id;

      const result = await db_fg.query(
        "SELECT * FROM proje_detaylari_admin WHERE id=?",
        [proje_id]
      );
      let unique_proje = result[0];

      await db_fg.query(
        "update proje_detaylari_admin set proje_goruntulenme_sayisi=proje_goruntulenme_sayisi+1 where id=?",
        [proje_id]
      );

      // console.log(unique_proje);

      if (unique_proje.length > 0) {
        //Her bir projenin eklenme tarihini okunabilir bir biçime getirmek için formatladım

        unique_proje = unique_proje.map((proje) => {
          const dom = new JSDOM(proje.proje_aciklamasi);

          // Render the DOM content on a web page
          const renderedContent = dom.window.document.querySelector(
            ".main-content-explanation"
          ).innerHTML;

          const dateString = proje.proje_eklenme_tarihi;
          const date = new Date(dateString);
          const options = { day: "numeric", month: "long", year: "numeric" };
          const formattedDate = date.toLocaleDateString("tr-TR", options);
          return {
            ...proje,
            proje_aciklamasi: renderedContent,
            proje_eklenme_tarihi: formattedDate,
            proje_takim_uyeleri: JSON.parse(
              JSON.parse(proje.proje_takim_uyeleri)
            ),
            proje_takim_uyeleri_gorevleri: JSON.parse(
              JSON.parse(proje.proje_takim_uyeleri_gorevleri)
            ),
          };
        });

        const proje = await db_fg.query(
          `select * from proje_detaylari_admin where email=?`,
          [unique_proje[0].email]
        );

        unique_proje[0].sirket = proje[0][0].COMPANY;
        unique_proje[0].departman = proje[0][0].DEPARTMENT;

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
      const {
        EMAIL: email,
        ID: user_id,
        NAME: name,
        SURNAME: surname,
      } = req.user;

      const form = req.body;
      console.log(form);

      const fullName = `${name} ${surname}`;

      const { originalname: fileName } = req.file;
      const buffer = Buffer.from(fileName, "latin1"); // Convert from latin1 to utf-8
      const decodedFileName = buffer.toString("utf-8");

      // console.log(decodedFileName);

      const filePath = `/images/project_images/${decodedFileName}`;

      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

      const dbQuery =
        "INSERT INTO `sql7605562`.`proje_detaylari` (`user_id`,`email`,`projeyi_ekleyen`,`proje_ismi`,`proje_konusu`,`proje_kategorisi`,`proje_sponsoru`,`proje_takim_uyeleri`, `proje_takim_uyeleri_gorevleri`,  `proje_aciklamasi`, `proje_resmi_isim`,`proje_resmi_path`, `proje_dosyalari_url`,`proje_eklenme_tarihi`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const queryParams = [
        user_id,
        email,
        fullName,
        form.project_name,
        form.project_subject,
        form.project_category,
        form.project_sponsor,
        JSON.stringify(form.project_team_members),
        JSON.stringify(form.project_team_members_duty),
        form.project_explanation,
        decodedFileName,
        filePath,
        form.project_file,
        formattedDate,
      ];
      await db_fg.query(dbQuery, queryParams);

      res.status(202).render("tebrikler", { form });
    } else {
      res.status(401).redirect("/");
    }
  } catch (err) {
    res.status(404).render("error");
    console.log(err);
  }
};
