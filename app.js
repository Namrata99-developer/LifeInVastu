const express = require("express");
const app = express();
const mongoose = require("mongoose");


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

app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});