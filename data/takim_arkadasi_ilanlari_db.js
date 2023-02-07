const mySql = require("mysql2");
const config = require("../config_db");
const db_takim_arkadasi_ilanlari = mySql.createConnection(
  config.db_takim_arkadasi_ilanlari
);

db_takim_arkadasi_ilanlari.connect(function (err) {
  if (err) {
    console.log(err);
    return ; 
  }

  console.log("Takim arkadasi ilanlari veritabanina basari ile baglandiniz");
  db_takim_arkadasi_ilanlari.end()
});

module.exports = db_takim_arkadasi_ilanlari.promise();
