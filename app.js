const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/userSchema");
const session = require("express-session"); // Add this line
const http = require("http");
const server = http.createServer(app);
const socketService = require("./services/socketService");

//requiring .env file to the server.
const env = require("dotenv").config();

const user_route = require("./routes/userRoutes");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Add session middleware
app.use(
  session({
    secret: "your-secret-key", // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false, // set to true if using HTTPS
    },
  })
);

app.use((req, res, next) => {
  res.header("Cache-Control", "no-store");
  next();
});

//setting the view engine and public folder
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

const db = require("./config/db");
db.connectDB();

checkDatabase();

app.use("/", user_route);

// Initialize socket.io
socketService.init(server);

//Starting the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server is Running");
});
