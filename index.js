//import section
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const userRouter = require("./routes/user.route");

//DB connection
mongoose.connect(process.env.MONGO_DB_URI);
mongoose.connection.on("connected", () => {
    console.log("DB connected");
});
mongoose.connection.on("error", (err) => {
    console.log("mongodb failed with", err);
});
//import routes

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

//routes middleware

app.get("/", (req, res) => {
    return res.send({ message: "Welcome :D" });
});

app.use("/users", userRouter);

//server listening
const port = 8000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});