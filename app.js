if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const ExpressError = require("./utils/ExpressError");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.DB_URL;
// "mongodb://127.0.0.1:27017/yelp-camp"
// process.env.DB_URL
mongoose
  .connect(dbUrl)
  .then((res) => {
    console.log("Succesfully COnnected to MongoDB");
  })
  .catch((err) => {
    console.log("Error in Connecting to MongoDB");
  });

const store = new MongoDBStore({
  url: dbUrl,
  secret: "secret",
  touchAfter: 24 * 60 * 60,
});

const sessionConfig = {
  store,
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    name: "session",
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.engine("ejs", ejsMate);

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const port = process.env.PORT || 400;

app.listen(port, () => {
  console.log(`Listening on Server ${port}`);
});

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get("/fakeUser", async (req, res) => {
  const user = new User({
    email: "aditya22@gmail.com",
    username: "aditya",
  });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 400 } = err;
  if (!err.message) {
    err.message = "Something Went Wrong";
  }
  res.status(statusCode).render("error", { err });
});
