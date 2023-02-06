// import section
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const app = express();
//DB connection
mongoose.connect(process.env.MONGO_DB_URI);
mongoose.connection.on("connected", () => {
    console.log("DB connected");
});
mongoose.connection.on("error", (err) => {
    console.log("mongodb failed with", err);
});

//import routes




app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(compression());

//router middleware

//server listening
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});