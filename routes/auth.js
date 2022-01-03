const express = require("express");
const {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require("../controllers/auth");
const {
  validateLogin,
  validateSignup,
  validateReset,
  validateNewPassword,
} = require("../middleware/validation/auth");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/login", isAuth(false), getLogin);
router.get("/signup", isAuth(false), getSignUp);
router.get("/reset", getReset);
router.get("/reset/:token", getNewPassword);

router.post("/login", isAuth(false), validateLogin, postLogin);
router.post("/signup", isAuth(false), validateSignup, postSignUp);
router.post("/logout", isAuth(true), postLogout);
router.post("/reset", validateReset, postReset);
router.post("/new-password", validateNewPassword, postNewPassword);

module.exports = router;
