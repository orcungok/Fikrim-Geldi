const mySql = require("mysql2");
const config = require("../config_db");
const db_fg = mySql.createPool(config.db_fg);


//Veritabanına config dosyasını kullanarak bağlanıyoruz.


// db_fg.connect(function (err) {
//   if (err) {
//     console.log(err);
//     console.log('Database connection is FAILED!')
//     return;
//   }

//   console.log('Database connetion is successfull !')

// });

module.exports = db_fg.promise();
