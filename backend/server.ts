import express from "express";
import { get } from "http";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`);
});