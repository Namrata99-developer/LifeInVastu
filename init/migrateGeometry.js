const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/LifeInVastu";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({
        geometry: { $exists: false }
    });

    console.log(`Found ${listings.length} listings without geometry.`);

    for (let listing of listings) {

        const query = `${listing.location}, ${listing.country}`;

        console.log(`Finding coordinates for: ${query}`);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
            {
                headers: {
                    "User-Agent": "LifeInVastu-PersonalProject/1.0"
                }
            }
        );

        const data = await response.json();

        if (data.length === 0) {
            console.log(`Location not found: ${query}`);
            continue;
        }

        const longitude = parseFloat(data[0].lon);
        const latitude = parseFloat(data[0].lat);

        listing.geometry = {
            type: "Point",
            coordinates: [longitude, latitude]
        };

        await listing.save();

        console.log(`Updated: ${listing.title}`);

        // Wait 1 second before the next request
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Geometry migration completed.");

    await mongoose.connection.close();
}

main().catch((err) => {
    console.log(err);
});