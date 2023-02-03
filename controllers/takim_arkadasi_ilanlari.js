const takim_arkadasi_ilanlari_db = require("../data/takim_arkadasi_ilanlari_db");
const projeler_db = require("../data/projeler_db");

exports.postAnnToAdminPage = async (req, res) => {
  try {
    if (req.user) {
      let email = req.user.EMAIL;
      let user_id = req.user.ID ; 
      let name = req.user.NAME;
      let surname = req.user.SURNAME;
      let fullName = name + " " + surname;
      let company = req.user.COMPANY;

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

      let form = req.body;
      let query =
        "INSERT INTO `takim_arkadasi_bul`.`ta_ilanlari` (`user_id`,`email`,`ilani_ekleyen`,`ilan_basligi`,`ilan_aciklamasi`, `ilan_tarihi`, `ilan_projesi`,`ilan_sirketi`)" +
        `VALUES ('${user_id}','${email}','${fullName}','${form.ann_title}','${form.ann_explanation}','${fullDate}','${form.ann_project_name}','${company}');`;

      const ta_ilan = await takim_arkadasi_ilanlari_db.query(query);
      res.render("tebrikler");
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    res.send("Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyiniz");
    console.log(error);
  }
};

exports.getAdminApprovedAnns = async (req, res) => {
  try {
    if (req.user) {
      let user_id = req.user.ID
      const resultsPerPage = 10;
      let sql = `select * from ta_ilanlari_admin`;
      const allDB = await takim_arkadasi_ilanlari_db.query(sql);
      const ilanlar = allDB[0];
      let email = req.user.EMAIL;

      const ilanlarLength = ilanlar.length; //hata ayıklama için dizi uzunluğunu kontrol et

      if (ilanlar.length > 0) {
        const numOfResults = ilanlar.length;
        const numberOfPages = Math.ceil(numOfResults / resultsPerPage);
        let page = req.query.sayfa ? Number(req.query.sayfa) : 1;
        let pageDec = page - 1;
        let pageInc = page + 1;
        if (page > numberOfPages) {
          res.redirect(
            "/takim_arkadasi_ilan_panosu?sayfa=" +
              encodeURIComponent(numberOfPages)
          );
        } else if (page < 1) {
          res.redirect(
            "/takim_arkadasi_ilan_panosu?sayfa=" + encodeURIComponent("1")
          );
        }
        //Determine the SQL LIMIT starting number
        const startingLimit = (page - 1) * resultsPerPage;
        //Get the relevant number of POSTS for this starting page
        sql = `SELECT * FROM ta_ilanlari_admin LIMIT ${startingLimit},${resultsPerPage}`;
        const limitData = await takim_arkadasi_ilanlari_db.query(sql);
        const result = limitData[0];
        //console.log(result)
        let iterator = page - 5 < 1 ? 1 : page - 5;
        let endingLink =
          iterator + 9 <= numberOfPages
            ? iterator + 9
            : page + (numberOfPages - page);
        if (endingLink < page) {
          //code orjinalinde page kısımlarına +4 ekleniyordu.
          iterator -= page - numberOfPages;
        }

        result.forEach(async (ilan) => {
          let sql = `select * from proje_detaylari_admin where proje_ismi='${ilan.ilan_projesi}'`;
          let proje = await projeler_db.query(sql);
          if (proje[0].length > 0) {
            //proje[0] uzunluğu her zaman 1

            const bulunan_proje = proje[0];
            if (bulunan_proje[0].proje_ismi == ilan.ilan_projesi) {
              ilan.proje_id = bulunan_proje[0].id;
              ilan.proje_resmi_url = bulunan_proje[0].proje_resmi_url;
            }
          }
        }); //result'ın içine (result, sayfa başına ilan sayısıdr.) for each döngüsü ile diğer veritabanından gelen projenin biglileri çekilmektedir.

        return res.render("ta_ilan_panosu", {
          ilanlar: result,
          page,
          iterator,
          pageDec,
          pageInc,
          endingLink,
          numberOfPages,
          email,
          ilanlarLength,
          user_id
        });
      } else {
        return res.render("ta_ilan_panosu", { ilanlarLength, email });
      }
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    res.send("Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyiniz");
    console.log(error);
  }
};

exports.getFilteredAnns = async (req, res) => {
  try {
    if (req.user) {
      let sirket = req.params.sirket.replaceAll("-", " ").toUpperCase();

      //console.log(sirket);

      let sql = `select * from ta_ilanlari_admin where ilan_sirketi='${sirket}'`;
      const allDB = await takim_arkadasi_ilanlari_db.query(sql);
      const unique_ilanlar = allDB[0];
      //console.log(unique_ilanlar);

      let email = req.user.EMAIL;

      const ilanlarLength = unique_ilanlar.length; //hata ayıklama için dizi uzunluğunu kontrol et
      if (unique_ilanlar.length > 0) {
        let headerCompany = unique_ilanlar[0].ilan_sirketi;

        unique_ilanlar.forEach(async (ilan) => {
          let sql = `select * from proje_detaylari_admin where proje_ismi='${ilan.ilan_projesi}'`;
          let proje = await projeler_db.query(sql);
          if (proje[0].length > 0) {
            //proje[0] uzunluğu her zaman 1

            const bulunan_proje = proje[0];
            if (bulunan_proje[0].proje_ismi == ilan.ilan_projesi) {
              ilan.proje_id = bulunan_proje[0].id;
              ilan.proje_resmi_url = bulunan_proje[0].proje_resmi_url;
            }
          }
        }); //result'ın içine (result, sayfa başına ilan sayısıdr.) for each döngüsü ile diğer veritabanından gelen projenin biglileri çekilmektedir.

        return res.render("ta_ilan_panosu", {
          ilanlar: unique_ilanlar,
          headerCompany,
          sirket,
          email,
        });
      } else {
        return res.render("ta_ilan_panosu", {
          ilanlar: unique_ilanlar,
          ilanlarLength,
          email,
        });
      }
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    res.send("Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyiniz");
    console.log(error);
  }
};

exports.taAnn_search = async (req, res) => {
  try {
    if (req.user) {
      const search_query = req.query.search_query;
      // console.log(search_query) ;

      let query = `
          SELECT * FROM ta_ilanlari_admin 
          WHERE ilan_basligi LIKE '%${search_query}%' 
          LIMIT 4
          `;

      const data = await takim_arkadasi_ilanlari_db.query(query);

      // console.log(data[0]) ;

      res.json(data);
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    res.send("Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyiniz");
    console.log(error);
  }
};
