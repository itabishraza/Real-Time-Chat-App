import express from "express";
import { get } from "http";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import connectToMongoDB from "./db/connectToMongoDB";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});