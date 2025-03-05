const mongoose = require("mongoose");

const env = require("dotenv").config();

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("Database is connected properly");
  } catch (error) {
    console.log(
      "Database is not connection. there is a error :-",
      error.message
    );
    process.exit(1);
  }
};

module.exports = {
  connectDB
}