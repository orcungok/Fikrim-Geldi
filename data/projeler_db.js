const mySql = require("mysql2");

const config = require("../config_db");
const connection_projeler = mySql.createPool(config.db_projeler);

// connection_projeler.connect(function (err) {
//   if (err) {
//     console.log(err);
//     return ; 
//   }

//   console.log("Proje Detaylari veritabanina başari ile baglandiniz");
// });

module.exports = connection_projeler.promise();
