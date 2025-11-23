// models/review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    vendor: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    service: { type: mongoose.Types.ObjectId, ref: "service" }, // optional
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("review", reviewSchema);
