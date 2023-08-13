const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const camps = await Campground.find({});
  res.render("campgrounds/index", { camps });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // if (!req.body.campground) {
  //   throw new ExpressError("Invalid Campground Data", 400);
  // }
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  // res.send(geoData.body.features[0].geometry);
  const camp = new Campground(req.body.campground);
  camp.geometry = geoData.body.features[0].geometry;
  camp.author = req.user._id;
  camp.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  await camp.save();
  console.log(camp);
  req.flash("success", "Succesfully made a new Campground");
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  camp;
  if (!camp) {
    req.flash("error", "Cannot find Campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { camp });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (req.body.campground.location !== camp.location) {
    let response = await geocoder
      .forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
      })
      .send();
    camp.geometry = response.body.features[0].geometry;
    camp.location = req.body.campground.location;
  }
  camp.title = req.body.campground.title;
  camp.description = req.body.campground.description;
  camp.price = req.body.campground.price;
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camp.images.push(...imgs);
  await camp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  console.log(camp);
  req.flash("success", "Succesfully updated Campground!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (!camp) {
    req.flash("error", "Cannot find Campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  for (let image of campground.images) {
    await cloudinary.uploader.destroy(image.filename);
  }
  req.flash("success", "Succesfully deleted Campground!");
  res.redirect("/campgrounds");
};
