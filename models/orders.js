const { Schema, model, Types } = require("mongoose");

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
      _id: false,
    },
  ],
  user: {
    email: { type: String, required: true },
    userId: { type: Types.ObjectId, required: true, ref: "User" },
  },
});

module.exports = model("Order", orderSchema);
