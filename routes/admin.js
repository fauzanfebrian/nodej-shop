const express = require("express");
const {
  getAddProduct,
  postAddProducts,
  getProducts,
  getEditProduct,
  postEditProducts,
  deleteProducts,
} = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");
const { validateAddProduct } = require("../middleware/validation/admin");

const router = express.Router();

router.use(isAuth());

router.get("/products", getProducts);
router.get("/add-product", getAddProduct);
router.get("/edit-product/:id", getEditProduct);

router.post("/add-product", validateAddProduct, postAddProducts);
router.post("/edit-product", validateAddProduct, postEditProducts);
router.delete("/product/:id", deleteProducts);

module.exports = router;
