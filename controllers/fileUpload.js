
//Bu controller bir kullanıcının yüklemiş olduğu proje kapak resminin kaynak kodun bulunduğu klasöre yüklenmesini sağlar.


const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"public/images/project_images"); // Dosyanın yükleneceği klasörü belirleyin.
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname); // Dosya adını koruyun.
  },
});
const upload = multer({ storage: storage });

module.exports = upload;