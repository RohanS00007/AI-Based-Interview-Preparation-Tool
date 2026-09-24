const mongoose = require("mongoose");

async function connectToDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("MongoDB Connection Error: Neither MONGODB_URI nor MONGO_URI is defined in your .env file.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
  }
}

module.exports = connectToDB;

