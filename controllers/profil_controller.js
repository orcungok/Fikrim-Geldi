const projeler_db = require("../data/projeler_db");
const { promisify } = require("util");
const login_db = require("../data/login_db");
const takim_arkadasi_ilanlari_db = require("../data/takim_arkadasi_ilanlari_db");

exports.getPersonalData = async (req, res) => {
  try {
    if (req.user) {
      let user_id = req.params.user_id;
      let email = req.user.EMAIL;

      const user = await login_db.query(`select * from users where id=?`, [
        user_id,
      ]); //user uzun saçma dizi, user[0] içinde tek bir obje bulunduran dizi

      const allDb = await projeler_db.query(
        `select * from proje_detaylari_admin where user_id='${user_id}'`
      );
      const unique_projeler = allDb[0];

      const allDb_TA = await takim_arkadasi_ilanlari_db.query(
        `select * from ta_ilanlari_admin where user_id='${user_id}'`
      );
      const unique_ilanlar = allDb_TA[0];

      res.render("profil", {
        unique_projeler: unique_projeler,
        unique_ilanlar: unique_ilanlar,
        unique_user: user[0],
        user_id,
        email,
      });
      //   "select * from users where id=?",
      //   [user_id],
      //   async (error, result) => {
      //     const allDb = await projeler_db.query(
      //       `select * from proje_detaylari_admin where user_id='${user_id}'`
      //     );

      //     const unique_projeler = allDb[0];

      //     const allDb_TA = await takim_arkadasi_ilanlari_db.query(
      //       `select * from ta_ilanlari_admin where user_id='${user_id}'`
      //     );
      //     const unique_ilanlar = allDb_TA[0];
      //     //console.log(unique_ilanlar)

      //     res.render("profil", {
      //       unique_projeler: unique_projeler,
      //       unique_ilanlar: unique_ilanlar,
      //       unique_user: result,
      //       user_id,
      //       email,
      //     });
      //   }
      // );
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.send("Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyiniz");
  }
};
