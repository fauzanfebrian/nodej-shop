const express = require("express");
const {
  getProducts,
  getProduct,
  getIndex,
  getCart,
  getOrders,
  postCart,
  postCartDelete,
  getInvoice,
  getCheckout,
  getCheckoutSuccess,
} = require("../controllers/shop");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/", getIndex);
router.get("/cart", isAuth(), getCart);
router.get("/orders", isAuth(), getOrders);
router.get("/orders/:orderId", isAuth(), getInvoice);
router.get("/checkout", isAuth(), getCheckout);
router.get("/checkout/success", isAuth(), getCheckoutSuccess);
router.get("/checkout/cancel", isAuth(), getCheckout);
router.get("/products", getProducts);
router.get("/products/:id", getProduct);

router.post("/cart", isAuth(), postCart);
router.post("/cart-delete-item", isAuth(), postCartDelete);

module.exports = router;
