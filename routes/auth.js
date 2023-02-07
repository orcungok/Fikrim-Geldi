const express = require("express");
const userController = require("../controllers/kullanıcılar");
const router = express.Router();

router.post("/kayit_ol", userController.register,(req,res)=>{


});
router.post("/giris_yap", userController.login,(req,res)=>{

});
router.get("/cikis_yap", userController.logout,(req,res)=>{

});
module.exports = router;