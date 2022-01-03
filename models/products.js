const { Schema, model, Types } = require("mongoose");

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: { type: Types.ObjectId, required: true, ref: "User" },
});

productSchema.statics.paginate = async function (page, arg2) {
  let option = {};
  let maxItem = 2;
  page = +page || 1;
  typeof arg2 === "object" ? (option = arg2) : (maxItem = +arg2 || 2);
  const totalProducts = await this.find().count();
  const prods = await this.find(option)
    .skip((page - 1) * maxItem)
    .limit(maxItem);
  const hasNextPage = maxItem * page < totalProducts;
  return {
    prods,
    hasNextPage,
    currentPage: page,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalProducts / maxItem),
  };
};

module.exports = model("Product", productSchema);
