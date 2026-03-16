const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");

const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


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


//index route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

//new route

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//create route

app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//show route

app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

//edit route

app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

//update route

app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
});

//delete listing

app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");

});

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

app.get("/", (req, res) => {
    res.send("Hi ! I'm root");
});

app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});