// models/Layer.js
const mongoose = require("mongoose");

const LayerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Kullanıcı kimliği
    weights: Object, // 2D array for weights
    name: String,

    testScore: Number,
    model_type: String,
    scaler: Object,
    max_y: Number,
    target: String,
    columns: [String],
    frames: [String], // Array of strings for frames
  },
  {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
  }
);

const Layer = mongoose.model("Layer", LayerSchema);

module.exports = Layer;
