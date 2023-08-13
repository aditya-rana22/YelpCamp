const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("../models/user");

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
