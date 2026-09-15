const Listing = require("../models/listing.js");

// module.exports.Index = async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
// }
module.exports.Index = async (req, res) => {
    const { category, search, trending } = req.query;

    let allListings;

    if (category) {
        allListings = await Listing.find({
            category: category
        });
    } else if (search) {
        allListings = await Listing.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });
    } else if (trending) {
        allListings = await Listing.find({})
            .sort({ reviews: -1 })
            .limit(8);
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, search });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

// module.exports.createListing = async (req, res, next) => {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = { filename, url };
//     await newListing.save();
//     req.flash("success", "Successfully created a new listing!");
//     res.redirect("/listings");
// }
module.exports.createListing = async (req, res, next) => {

    let url = req.file.path;
    let filename = req.file.filename;

    const location = req.body.listing.location;

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`,
        {
            headers: {
                "User-Agent": "LifeInVastu-PersonalProject/1.0"
            }
        }
    );

    const data = await response.json();

    if (data.length === 0) {
        req.flash("error", "Location not found!");
        return res.redirect("/listings/new");
    }

    const longitude = parseFloat(data[0].lon);
    const latitude = parseFloat(data[0].lat);

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = { filename, url };

    newListing.geometry = {
        type: "Point",
        coordinates: [longitude, latitude]
    };

    await newListing.save();

    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_290");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {

        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { filename, url };
        await listing.save();
    }

    req.flash("success", " Updated listing!");
    res.redirect("/listings");
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Successfully deleted listing!");

    res.redirect("/listings");

}