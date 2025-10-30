const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true
    },
    products: [{
      productData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      }
    }],


  }, {
  collection: "Carts",
  timestamps: true
}
);




const Cart = mongoose.model("Carts", cartSchema);

module.exports = Cart;
