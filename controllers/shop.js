const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(
  "sk_test_51KD62MKqKPJ9J9Ju8ZvTjqZCGHpc0CwlLPIREmdnKE8gAhxrBlpzvB5QqeC522X1twhxEgpCBgjkykKaRTdFMFsG00vyCPkwXq"
);

const Products = require("../models/products");
const Order = require("../models/orders");
const createInvoice = require("../utils/createInvoice");

exports.getProducts = async (req, res, next) => {
  try {
    const paginate = await Products.paginate(req.query.page);
    res.render("shop/product-list", { ...paginate, pageTitle: "All Products" });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .render("404", { pageTitle: "Page Not Found!!", path: "" });

    res.render("shop/product-detail", {
      product,
      pageTitle: `Detail Product || ${product.title}`,
      path: "/products",
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.getIndex = async (req, res, next) => {
  try {
    const paginate = await Products.paginate(req.query.page);
    return res.render("shop/index", { ...paginate, pageTitle: "Shop" });
  } catch (error) {
    console.error(error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    res.render("shop/cart", { pageTitle: "Your Cart", products });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id });
    res.render("shop/orders", { pageTitle: "Your Orders", orders });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.getInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join("data", "invoice", invoiceName);

    const order = await Order.findOne({
      _id: orderId,
      "user.userId": req.user,
    });
    if (!order) {
      req.flash("error", "Unauthorized");
      return res.redirect("/orders");
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
    return createInvoice(order, [res, fs.createWriteStream(invoicePath)]);
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    const totalSum = products.reduce(
      (acc, p) => (acc += p.quantity * p.productId.price),
      0
    );
    let session;
    if (products.length > 0) {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => ({
          name: p.productId.title,
          description: p.productId.description,
          amount: p.productId.price * 100,
          currency: "usd",
          quantity: p.quantity,
        })),
        success_url: "https://nodej-shop.herokuapp.com/checkout/success",
        cancel_url: "https://nodej-shop.herokuapp.com/checkout/cancel",
      });
    }

    res.render("shop/checkout", {
      pageTitle: "Checkout",
      sessionId: session ? session.id : "",
      products,
      totalSum,
    });
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((p) => ({
      quantity: p.quantity,
      product: { ...p.productId._doc },
    }));
    await Order.create({
      user: { email: req.user.email, userId: req.user },
      products,
    });
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const product = await Products.findById(productId);
    await req.user.addToCart(product);
    return res.redirect("/cart");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.postCartDelete = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    await req.user.destroyCartItem(productId);
    res.redirect("/cart");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
