if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");
const { error } = require("console");


//const MONGO_URL = "mongodb://127.0.0.1:27017/LifeInVastu";
const dbUrl = process.env.ATLASDB_URL;

main().then((res) => {
    console.log("Connected to db");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
}

let port = 8080;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("Error in Mongo session store", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
};


// app.get("/", (req, res) => {
//     res.send("Hi ! I'm root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    app.locals.currentUser = req.user;
    next();
});

// app.get("/demoUser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "student"
//     });

//     let registerdUser = await User.register(fakeUser, "helloWorld");
//     res.send(registerdUser);
// })
// const validateListing = (req, res, next) => {

//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         let errmsg = error.details.map(el => el.message).join(",");
//         throw new ExpressError(400, errmsg);
//     } else {
//         next();
//     }
// }

// const validateReview = (req, res, next) => {

//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         let errmsg = error.details.map(el => el.message).join(",");
//         throw new ExpressError(400, errmsg);
//     } else {
//         next();
//     }
// }

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);

//index route
// app.get("/listings", wrapAsync(async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
// }));


//new route

// app.get("/listings/new", (req, res) => {
//     res.render("listings/new.ejs");
// });

//create route

// app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
// if (!req.body.listing) {
//     throw new ExpressError("Invalid Listing Data", 400);
// }
// if (!newListing.description) {
//     throw new ExpressError("Description is required", 400);
// }
// if (!newListing.title) {
//     throw new ExpressError("Title is required", 400);
// }
// if (!newListing.location) {
//     throw new ExpressError("Location is required", 400);
// }


// let result = listingSchema.validate(req.body);
// console.log(result);
// if (result.error) {
//     throw new ExpressError(400, result.error);
// }
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
// }));

//show route

// app.get("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs", { listing });
// }));

//edit route

// app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
// }));

//update route

// app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect("/listings");
// }));

//delete listing

// app.delete("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const deleteListing = await Listing.findByIdAndDelete(id);
//     console.log(deleteListing);
//     res.redirect("/listings");

// }));

// //POST Review Routes
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//     let listing = await Listing.findById(req.params.id);
//     let review = new Review(req.body.review);

//     listing.reviews.push(review);

//     await review.save();
//     await listing.save();

//     res.redirect(`/listings/${listing._id}`);
// }));

// //delete Review Route
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;

//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
// }))

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My Peace",
//         description: "near god",
//         price: 99999,
//         location: "Swarga",
//         country: "Not defined"
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Sucsessful testing");
// });
app.all("{/*splat}", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});


app.use((err, req, res, next) => {
    let { message = "Something Went Wrong", statusCode = 500 } = err;
    res.status(statusCode).render("error.ejs", { message });
    //res.send(message).status(statusCode);
});


app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});