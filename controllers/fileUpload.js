
const multer = require("multer");
const iconv = require('iconv-lite');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"https://fikrim-geldi.onrender.com/images/project_images/"); // Dosyanın yükleneceği klasörü belirleyin.
  },
  filename: function (req, file, cb) {

   const encodedFileName = file.originalname;
   const decodedFileName = iconv.decode(Buffer.from(encodedFileName, "binary"), "utf-8");


    cb(null, decodedFileName); // Dosya adını koruyun.
    console.log(decodedFileName)
  },
});
const upload = multer({ storage: storage });

module.exports = upload;