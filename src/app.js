// Setup ENV
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Required Imports
const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes");

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/v1", routes);

if (process.env.NODE_ENV === "local") {
app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `Server running on port ${PORT}`);
});
}

module.exports = { app };
