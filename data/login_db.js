const mySql = require("mysql2");
const config = require("../config_db");
const login_db = mySql.createPool(config.db_login);

// login_db.connect(function (err) {
//   if (err) {
//     console.log(err);
//     return;
//   }

//   console.log("Kullanici bilgileri veritabanina başariyla baglandiniz.");
// });

module.exports = login_db.promise();

