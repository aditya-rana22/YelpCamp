const mongoose = require("mongoose");
const Review = require("./review");
const User = require("./user");

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

ImageSchema.virtual("cardImage").get(function () {
  return this.url.replace("/upload", "/upload/ar_5:3,c_crop");
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    title: String,
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<b><a href="/campgrounds/${this._id}">${this.title}</a></b>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
  console.log("deleted");
});

const Campground = mongoose.model("Campground", CampgroundSchema);
module.exports = Campground;
