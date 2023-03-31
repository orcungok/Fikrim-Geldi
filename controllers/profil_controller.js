const db_fg = require("../data/db_fg");
const { promisify } = require("util");


//Bu controller kullanıcının kişisel bilgilerinin ve sisteme eklemiş olduğu projelerin görüntülenmesini sağlar. 


exports.getPersonalData = async (req, res) => {
  try {
    if (req.user) {
      let user_id = req.params.user_id;
      let email = req.user.EMAIL;

      const user = await db_fg.query(`select * from kullanicilar where id=?`, [
        user_id,
      ]);

      const allDb = await db_fg.query(
        `select * from proje_detaylari_admin where user_id='${user_id}'`
      );
      const unique_projeler = allDb[0];
      let upLength = unique_projeler.length;

      res.render("profil", {
        unique_projeler: unique_projeler,
        unique_user: user[0],
        user_id,
        email,
        upLength,
      });
    } else {
      res.status(401).redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.send("Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyiniz");
  }
};
