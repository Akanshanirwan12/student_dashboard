const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();   // ✅ THIS LINE WAS MISSING

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
