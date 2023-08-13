const mongoose = require("mongoose");
const Campground = require("../models/campground");
const { descriptors, places } = require("./seedHelpers");
const cities = require("./cities");
const axios = require("axios");
const Review = require("../models/review");
const User = require("../models/user");
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then((res) => {
    console.log("Succesfully COnnected to MongoDB");
  })
  .catch((err) => {
    console.log("Error in Connecting to MongoDB");
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  await Review.deleteMany({});
  // await User.deleteMany({});
  const config = {
    params: {
      client_id: "LBSj81O7GTDsUT5GQO_BiaiyLptyNx7wTEwDbmhRqsk",
      collections: 1114848,
    },
  };
  for (let i = 0; i < 200; i++) {
    // const datas = await axios.get(
    //   "https://api.unsplash.com/photos/random",
    //   config
    // );
    // const newImage = await datas.data.urls.small;
    const currentCity = sample(cities);
    const price = Math.floor(Math.random() * 30) + 10;
    const camp = new Campground({
      author: "64d4edb8cc0f25f412950a8c",
      geometry: {
        type: "Point",
        coordinates: [currentCity.longitude, currentCity.latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dzuhcc2ht/image/upload/v1691871260/YelpCamp/qsxetam8kt3qonhoecd2.jpg",
          fileName: "YelpCamp/qsxetam8kt3qonhoecd2",
        },
      ],
      price: price,
      location: `${currentCity.city}, ${currentCity.state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum facilis, veritatis architecto autem molestiae totam fugit cum eos asperiores voluptate. Id vero sit fuga quas numquam non impedit optio ducimus.",
    });
    await camp.save();
  }
};
seedDB().then((res) => {
  mongoose.connection.close();
  console.log("Connection Closed");
});
