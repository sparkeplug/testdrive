const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;

app.use(express.static("dist"));

app.listen(PORT, () => {
  console.log(`APP listening at http://localhost:3000`);
});
