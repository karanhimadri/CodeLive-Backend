require("dotenv").config();
const mongoose = require("mongoose");

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("DB Connection failed", error.message);
  }
};

module.exports = ConnectDB

