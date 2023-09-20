const express = require("express");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const router = express.Router();

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("User is already registered, log in instead");
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password that is 6+ characters long and is alphanumeric"
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      console.log(req.body, req.body.password);
      if (value !== req.body.password) {
        throw new Error("Passwords does not match");
      }
      return true;
    })
    .trim(),
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
