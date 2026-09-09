const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/LifeInVastu";
main().then((res) => {
    console.log("Connected to db");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6a9d7149df619eb8f1ac844b" }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();
