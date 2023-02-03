// const mysql = require("mysql2");
const projeler_db = require("../data/projeler_db");
const login_db = require("../data/login_db");

const { promisify } = require("util");
const { db_projeler } = require("../config_db");
const { type } = require("os");

exports.getAdminApprovedProjects = async (req, res) => {
  try {
    if (req.user) {
      let user_id = req.user.ID;
      const resultsPerPage = 10;
      let sql = "SELECT * FROM proje_detaylari_admin";
      const allDB = await projeler_db.query(sql);
      const projeler = allDB[0];
      let email = req.user.EMAIL;

      if (projeler.length > 0) {
        const numOfResults = projeler.length;
        const numberOfPages = Math.ceil(numOfResults / resultsPerPage);
        let page = req.query.sayfa ? Number(req.query.sayfa) : 1;
        //console.log(page)
        let pageDec = page - 1;
        let pageInc = page + 1;
        if (page > numberOfPages) {
          res.redirect(
            "/proje_kutuphanesi?sayfa=" + encodeURIComponent(numberOfPages)
          );
        } else if (page < 1) {
          res.redirect("/proje_kutuphanesi?sayfa=" + encodeURIComponent("1"));
        }
        //Determine the SQL LIMIT starting number
        const startingLimit = (page - 1) * resultsPerPage;
        //Get the relevant number of POSTS for this starting page
        sql = `SELECT * FROM proje_detaylari_admin LIMIT ${startingLimit},${resultsPerPage}`;
        const limitData = await projeler_db.query(sql);
        const result = limitData[0];
        let iterator = page - 5 < 1 ? 1 : page - 5;
        let endingLink =
          iterator + 9 <= numberOfPages
            ? iterator + 9
            : page + (numberOfPages - page);
        if (endingLink < page) {
          //code orjinalinde page kısımlarına +4 ekleniyordu.
          iterator -= page - numberOfPages;
        }

        //console.log(result);

        return res.render("proje_kütüphanesi", {
          projeler: result,
          page,
          iterator,
          pageDec,
          pageInc,
          endingLink,
          numberOfPages,
          email,
          user_id
        });
      } else {
        let user_id = req.user.ID;
        let email = req.user.EMAIL;
        return res.render("proje_kütüphanesi", { email,user_id });
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

      let query = `
          SELECT * FROM proje_detaylari_admin 
          WHERE proje_ismi LIKE '%${search_query}%' 
          LIMIT 4
          `;

      const data = await projeler_db.query(query);
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
      const unique_proje = allDb[0];

      if (unique_proje.length > 0) {
        login_db.query(
          "select * from users where email=?",
          unique_proje[0].email,
          async (error, result) => {
            if (error) {
              console.log(error);
            }

            let sirket = result[0].COMPANY;
            let departman = result[0].DEPARTMENT;
            unique_proje[0].sirket = sirket;
            unique_proje[0].departman = departman;
            //console.log(unique_proje) ;

            res.render("proje_blog", {
              unique_proje: unique_proje,
              user_email,
              user_id
            });
          }
        );
      } else {
        res.render("error");
      }
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.render("error");
  }
};

// PROJE KUTUPHANESİ CONTROLLERS

exports.getFilteredProjects = async (req, res) => {
  try {
    if (req.user) {
      let kategori = req.params.kategori.replaceAll("-", " ");

      let sql = `select * from proje_detaylari_admin where proje_kategorisi='${kategori}'`;
      const allDB = await projeler_db.query(sql);
      const unique_kategori = allDB[0];
      //console.log(unique_kategori);

      let email = req.user.EMAIL;

      const projelerLength = unique_kategori.length; //hata ayıklama için dizi uzunluğunu kontrol et
      if (unique_kategori.length > 0) {
        let headerKategori = unique_kategori[0].proje_kategorisi;

        return res.render("proje_kütüphanesi", {
          projeler: unique_kategori,
          headerKategori,
          kategori,
          email,
        });
      } else {
        return res.render("proje_kütüphanesi", {
          projeler: unique_kategori,
          projelerLength,
          email,
        });
      }
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
};

// PROJE KUTUPHANESİ CONTROLLERS
