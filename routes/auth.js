const express = require("express");
const userController = require("../controllers/kullanıcılar");
const router = express.Router();

router.post("/kayit_ol", userController.register);
router.post("/giris_yap", userController.login);
router.get("/cikis_yap", userController.logout);
module.exports = router;