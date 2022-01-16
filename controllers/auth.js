const User = require("../models/user");
const errorsValidate = require("../utils/errorsValidate");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "anjingkoid@gmail.com",
    pass: "lahat170205",
  },
});

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    oldInput: {},
    validationErrors: {},
  });
};
exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    oldInput: {},
    validationErrors: {},
  });
};
exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    oldInput: {},
    validationErrors: {},
  });
};
exports.getNewPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) return res.redirect("/reset");
    res.render("auth/new-password", {
      pageTitle: "Set new Password",
      token,
      oldInput: {},
      validationErrors: {},
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy(() => res.redirect("/"));
};
exports.postSignUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { isEmpty, validationErrors, errorsArray } = errorsValidate(req);
    if (!isEmpty)
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        errorMessage: errorsArray[0].msg,
        oldInput: req.body,
        validationErrors,
      });

    await User.create({ email, password });
    res.redirect("/login");
    transporter.sendMail({
      to: email,
      from: "NodeShop shop@fauzan.com",
      subject: "Signup succeed!",
      html: "<h1>You successfully signed up!</h1>",
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.postLogin = async (req, res, next) => {
  const { isEmpty, validationErrors, errorsArray } = errorsValidate(req);
  if (!isEmpty)
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      errorMessage: errorsArray[0]?.msg,
      oldInput: req.body,
      validationErrors,
    });

  res.redirect("/");
};
exports.postReset = async (req, res, next) => {
  try {
    const { isEmpty, validationErrors, errorsArray } = errorsValidate(req);
    if (!isEmpty)
      return res.status(422).render("auth/reset", {
        pageTitle: "Reset Password",
        errorMessage: errorsArray[0]?.msg,
        oldInput: req.body,
        validationErrors,
      });
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with that email found");
      return res.redirect("/reset");
    }
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");
    user.resetToken = token;
    await user.save();
    req.flash("success", "Check your email, to reset your password");
    res.redirect("/");
    transporter.sendMail({
      to: req.body.email,
      from: "NodeShop shop@fauzan.com",
      subject: "Password reset",
      html: `
        <p>You requested a password reset</p>
        <p>
          Click this 
          <a href="${process.env.APP_URI}/reset/${token}">link</a> 
          to set a new password
        </p>
      `,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.postNewPassword = async (req, res, next) => {
  try {
    const { password, token } = req.body;
    const { isEmpty, validationErrors, errorsArray } = errorsValidate(req);
    if (!isEmpty)
      return res.status(422).render("auth/new-password", {
        pageTitle: "Set new Password",
        errorMessage: errorsArray[0]?.msg,
        oldInput: req.body,
        validationErrors,
        token,
      });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("error", "Reset password token is expired");
      return res.redirect("/reset");
    }

    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    user.password = password;
    await user.save();
    req.flash("success", "Your password already changed");
    res.redirect("/login");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
