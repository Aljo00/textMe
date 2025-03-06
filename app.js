const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/userSchema");
const session = require("express-session"); // Add this line

//requiring .env file to the server.
const env = require("dotenv").config();

const user_route = require("./routes/userRoutes");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

//setting the view engine and public folder
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

const db = require("./config/db");
db.connectDB();

// To check if collections are empty
const checkDatabase = async () => {
  try {
    const count = await User.countDocuments();
    console.log(`Current users in database: ${count}`);
  } catch (error) {
    console.error("Error checking database:", error);
  }
};

checkDatabase();

app.use("/", user_route);

//Starting the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server is Running");
});
