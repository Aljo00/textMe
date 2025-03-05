const express = require("express");
const app = express();

//requiring .env file to the server.
const env = require("dotenv").config();

const user_route = require("./routes/userRoutes");

//setting the view engine and public folder
app.set("view engine", "ejs");
app.set("views", './views');

app.use(express.static("public"));

const db = require("./config/db");
db.connectDB();

app.use("/", user_route);

//Starting the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server is Running");
});
