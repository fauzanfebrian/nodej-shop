const fs = require("fs");
const pathDir = require("../utils/path");
const errorsValidate = require("../utils/errorsValidate");
const Product = require("../models/products");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    editing: false,
    product: {},
    validationErrors: {},
  });
};
exports.getEditProduct = async (req, res, next) => {
  try {
    if (!req.query.edit) return res.redirect("/admin/products");
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user,
    });

    if (!product)
      return res
        .status(404)
        .render("404", { pageTitle: "Page Not Found!!", path: "" });

    res.render("admin/edit-product", {
      pageTitle: `Edit Product || ${product.title}`,
      editing: req.query.edit,
      product: product,
      validationErrors: {},
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.getProducts = async (req, res, next) => {
  try {
    const paginate = await Product.paginate(req.query.page, {
      userId: req.user,
    });
    console.log(paginate);
    // .select("title price -_id")
    // .populate("userId", "name");
    res.render("admin/products", { ...paginate, pageTitle: "Admin Product" });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.postAddProducts = async (req, res, next) => {
  try {
    const image = req.file;
    const { errorsArray, validationErrors, isEmpty } = errorsValidate(req);

    if (!isEmpty)
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        editing: false,
        errorMessage: errorsArray[0].msg,
        product: req.body,
        validationErrors,
      });
    if (!image)
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        editing: false,
        errorMessage: "File must be attached with an image",
        product: req.body,
        validationErrors: { image: true },
      });

    const product = new Product({
      ...req.body,
      userId: req.user,
      imageUrl: `${process.env.APP_URI}/images/${image.filename}`,
    });
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.postEditProducts = async (req, res, next) => {
  try {
    const image = req.file;
    const { errorsArray, validationErrors, isEmpty } = errorsValidate(req);
    if (!isEmpty)
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        editing: true,
        errorMessage: errorsArray[0].msg,
        product: req.body,
        validationErrors,
      });
    const product = await Product.findOne({
      _id: req.body.id,
      userId: req.user,
    });
    if (image) {
      const imageName = product.imageUrl.split("/").pop();
      fs.unlink(`${pathDir}/public/images/${imageName}`, () => {});
      product.imageUrl = `${process.env.APP_URI}/images/${image.filename}`;
    }
    product.title = req.body.title;
    product.price = req.body.price;
    product.description = req.body.description;
    await product.save();

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.deleteProducts = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user,
    });
    if (!product) return res.status(404).json({ message: "no product found" });
    const imageName = product.imageUrl.split("/").pop();
    fs.unlink(`${pathDir}/public/images/${imageName}`, () => {});
    await product.delete();
    res.json({ message: "product deleted" });
  } catch (error) {
    res.status(500).json({ message: "deleting product failed" });
  }
};
