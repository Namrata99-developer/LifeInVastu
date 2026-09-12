const express = require('express');
const router = express.Router({ "mergeParams": true });

const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const ReviewController = require("../controllers/reviews.js");



//POST Review Routes
router.post("/", isLoggedIn, validateReview, wrapAsync(ReviewController.createReview));

//delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(ReviewController.deleteReview));

module.exports = router;