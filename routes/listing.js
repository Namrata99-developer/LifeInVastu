const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");

//index route
router.get("/", wrapAsync(ListingController.Index));

//new route

router.get("/new", isLoggedIn, ListingController.renderNewForm);

//create route

router.post("/", isLoggedIn, validateListing, wrapAsync(ListingController.createListing));


//show route

router.get("/:id", wrapAsync(ListingController.showListing));

//edit route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

//update route

router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(ListingController.updateListing));

//delete listing

router.delete("/:id", isLoggedIn, isOwner, wrapAsync(ListingController.deleteListing));

module.exports = router;