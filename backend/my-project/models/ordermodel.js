const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'Users',
      required: true
    },

    purchasedItems: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Products',
          required: true
        },
        productname: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        },
        price: {
          type: Number,
          required: true
        },
        totalPrice: {
          type: Number,
          required: true
        }
      }
    ],

    totalOrderPrice: {
      type: Number,
      required: true
    },

    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },

    paymentMethod: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash'
    },

    cardInfo: {
      number: { type: String },
      name: { type: String },
      expiry: { type: String },
      cvv: { type: String }
    }

  },
  {
    collection: 'Orders',
    timestamps: true
  }
);

const orderModel = mongoose.model('Orders', orderSchema);
module.exports = orderModel;
