const { Schema, model, Types } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  password: {
    type: String,
    required: true,
    set(v) {
      return bcrypt.hashSync(v, 12);
    },
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: { type: Types.ObjectId, required: true, ref: "Product" },
        quantity: { type: Number, default: 1 },
        _id: false,
      },
    ],
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};
userSchema.methods.destroyCartItem = function (productId) {
  this.cart.items = this?.cart?.items?.filter?.(
    (cp) => cp.productId.toString() !== productId.toString()
  );
  return this.save();
};
userSchema.methods.addToCart = function (product) {
  const userCartItems = this?.cart?.items ? [...this.cart.items] : [];
  const indexCart = userCartItems.findIndex(
    (cp) => cp.productId.toString() === product._id.toString()
  );

  if (indexCart >= 0) userCartItems[indexCart].quantity += 1;
  else userCartItems.push({ productId: product._id });

  this.cart = { items: userCartItems };
  return this.save();
};

userSchema.pre("save", function () {
  if (this.isModified("resetToken") && this.resetToken) {
    this.resetTokenExpiration = new Date(new Date().getTime() + 3600000);
  }
});

module.exports = model("User", userSchema);
