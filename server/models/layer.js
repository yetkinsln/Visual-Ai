// models/Layer.js
const mongoose = require("mongoose");

const LayerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Kullanıcı kimliği
    weights: Object, // 2D array for weights
    name: String,
  },
  {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
  }
);

const Layer = mongoose.model("Layer", LayerSchema);

module.exports = Layer;
