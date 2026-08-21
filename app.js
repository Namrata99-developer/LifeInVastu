const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const MONGO_URL = "mongodb://127.0.0.1:27017/LifeInVastu";
main().then((res) => {
    console.log("Connected to db");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
}

let port = 8080;


app.get("/", (req, res) => {
    res.send("Hi ! I'm root");
});

const validateListing = (req, res, next) => {

    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
}
//index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//new route

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//create route

app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
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
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//show route

app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//edit route

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update route

app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
}));

//delete listing

app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");

}));

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