const User = require("../models/user");
const Product = require("../models/products");

module.exports = () =>
  setInterval(async () => {
    const products = await Product.find();
    const users = await User.find();
    const usersId = users.map((u) => u._id.toString());
    const productsId = products.map((p) => p._id.toString());

    const filterTRUEData = (data) => data;
    const [getProductsToDestroy, destroyProduct] = [
      (product) =>
        usersId.includes(product.userId.toString()) ? null : product._id,
      async (id) => await Product.findByIdAndDelete(id),
    ];
    const [getNewCarts, saveUserCart] = [
      (user) => {
        const cartItemsBefore = user.cart.items;
        if (!cartItemsBefore || cartItemsBefore.length < 1) return;
        const cartItems = cartItemsBefore
          .map((cart) =>
            productsId.includes(cart?.productId?.toString?.()) ? cart : null
          )
          .filter(filterTRUEData);
        return cartItems.length === cartItemsBefore.length
          ? null
          : {
              id: user._id,
              cartItems,
            };
      },
      async (data) =>
        await User.findByIdAndUpdate(data?.id, {
          cart: { items: data?.cartItems },
        }),
    ];

    if (productsId.length > 0)
      products
        .map(getProductsToDestroy)
        .filter(filterTRUEData)
        .forEach(destroyProduct);
    if (usersId.length > 0)
      users.map(getNewCarts).filter(filterTRUEData).forEach(saveUserCart);
  }, 1000);
