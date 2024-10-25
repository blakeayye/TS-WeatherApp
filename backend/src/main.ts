// backend/src/index.ts

import express from "express";
console.log("hio");
const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Hello from the TypeScript backend!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
