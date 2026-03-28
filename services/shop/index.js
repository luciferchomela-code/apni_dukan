
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./src/config/db.js";
import cors from "cors";
import router from "./src/routes/shop.route.js";
import itemRouter from "./src/routes/Item.route.js";

const app = express();

app.use(cors());
app.use(express.json());                        
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5001;

app.use("/api/shop", router); 
app.use("/api/item", itemRouter)

connectDB();

app.listen(PORT, () => {
    console.log(`Shop service running on port ${PORT}`);
});