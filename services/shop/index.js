import express from "express";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, ()=>{
  console.log(`Auth service running on port ${PORT}`)
})
