const express = require("express");
const router = express.Router();
const { promisify } = require("util");

const userController = require("../controllers/kullanıcılar");
const projectController = require("../controllers/projeler");
const addProjectController = require("../controllers/proje_ekle_ap");
const profileController = require("../controllers/profil_controller");
const teamMateAnnController = require("../controllers/takim_arkadasi_ilanlari");
const adminPanelController = require("../controllers/admin_panel");

const { token } = require("morgan");
const { type } = require("os");

router.get(["/", "/giris_yap"], (req, res) => {
  res.render("giriş_yap");
});

router.get("/kayit_ol", (req, res) => {
  res.render("kayıt_ol");
});

router.get("/anasayfa", userController.isLoggedIn, (req, res) => {
  try {
    if (req.user) {
      const role = req.user.ROLE;
      const email = req.user.EMAIL;
      const user_id = req.user.ID;
      res.render("anasayfa", { user: req.user, role, email, user_id });
    } else {
      res.redirect("/giris_yap");
    }
  } catch (error) {
    res.status(404).render("error");
  }
});

router.get(
  "/anasayfa/admin",
  userController.isLoggedIn,
  adminPanelController.getAdminPanelData,
  (req, res) => {}
);

router.post(
  "/anasayfa/admin",
  userController.isLoggedIn,
  adminPanelController.postFromAdminPanel,
  (req, res) => {}
);

router.get(
  "/proje_kutuphanesi/:kategori",
  userController.isLoggedIn,
  projectController.getFilteredProjects,
  (req, res) => {}
);

router.get(
  "/proje_kutuphanesi",
  userController.isLoggedIn,
  projectController.getAdminApprovedProjects,
  async (req, res, next) => {}
);

router.get(
  "/projeler/:proje_id",
  userController.isLoggedIn,
  projectController.getProjectBlog,
  (req, res) => {}
);

router.get("/projeler/", (req, res) => {
  res.status(404).render("error");
});

router.post(
  "/proje_ekle",
  userController.isLoggedIn,
  addProjectController.add_projects_ap,
  (req, res) => {}
);

router.get("/proje_ekle", userController.isLoggedIn, (req, res) => {
  let user_id = req.user.ID;

  res.render("proje_ekle", { user_id });
});

router.get(
  "/profil/:user_id",
  userController.isLoggedIn,
  profileController.getPersonalData,
  (req, res) => {}
);

router.get(
  "/projeleri_ara",
  userController.isLoggedIn,
  projectController.projects_search,
  (req, res) => {}
);

router.get(
  "/ilanlari_ara",
  userController.isLoggedIn,
  teamMateAnnController.taAnn_search,
  (req, res) => {}
);

router.get("/sifremi_unuttum", function (req, res) {
  res.render("şifremi_unuttum");
});
router.post(
  "/sifremi_unuttum",
  userController.forgot_password,
  (req, res) => {}
);

router.get("/sifremi_guncelle", (req, res) => {
  const token = req.query.token;
  res.render("şifremi_güncelle", { token: token });
});
router.post("/sifremi_guncelle", userController.update_password, (req, res) => {
  res.render("şifremi_güncelle");
});

router.get(
  "/takim_arkadasi_ilan_panosu",
  userController.isLoggedIn,
  teamMateAnnController.getAdminApprovedAnns,
  (req, res) => {}
);

router.get(
  "/takim_arkadasi_ilan_panosu/:sirket",
  userController.isLoggedIn,
  teamMateAnnController.getFilteredAnns,
  (req, res) => {}
);

router.get(
  "/takim-arkadasi-ilani-ver",
  userController.isLoggedIn,
  (req, res) => {
    res.render("ta_ilan_ver", { user_id: req.user.ID });
  }
);

router.post(
  "/takim-arkadasi-ilani-ver",
  userController.isLoggedIn,
  teamMateAnnController.postAnnToAdminPage,
  (req, res) => {}
);

module.exports = router;
