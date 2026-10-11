const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PackSureAI backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PackSureAI server running on port ${PORT}`);
});