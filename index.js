//import section
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const userRouter = require("./routes/user.route");
const cors = require("cors");
const socketio = require("socket.io");
const app = express();

//Routes
const clubRoutes = require("./routes/club.route");
const activityRoutes = require("./routes/activity.route");

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
const http = require("http").createServer(app);
const io = socketio(http);
const dotenv = require("dotenv");
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//usee Routes
app.use("/club", clubRoutes);
app.use("/activity", activityRoutes);

app.get("/", (req, res) => {
  return res.send({ message: "Welcome :D" });
});

app.use("/users", userRouter);

//server listening
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
