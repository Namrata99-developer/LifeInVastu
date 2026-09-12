const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");

//index route and create route
router
    .route("/")
    .get(wrapAsync(ListingController.Index))
    .post(isLoggedIn, validateListing, wrapAsync(ListingController.createListing));


//new route

router.get("/new", isLoggedIn, ListingController.renderNewForm);


// show route , update route, delete route

router
    .route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(isLoggedIn, isOwner, validateListing, wrapAsync(ListingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(ListingController.deleteListing));


//edit route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));


module.exports = router;