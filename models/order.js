const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  user: {
    _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
  },
  items: [
    {
      productId: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
});

module.exports = model("order", orderSchema);
