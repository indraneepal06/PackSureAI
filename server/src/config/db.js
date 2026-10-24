const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "PackSureAI" });
    console.log("MongoDB Atlas Connected Successfully");
  } catch (error) {
    console.log("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;