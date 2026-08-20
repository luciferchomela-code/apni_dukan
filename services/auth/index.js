import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import connectDB from "./src/config/db.js"
import authRoute from "./src/routes/auth.route.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoute)
app.get("/keep-alive", async (req,res) => {
    const urls = [
        "https://apni-dukan-shop.onrender.com/health",
        "https://apni-dukan-rider.onrender.com/health",
        "https://apni-dukan-realtime.onrender.com/health",
        "https://apni-dukan-utils.onrender.com/health"
    ];
    await Promise.all(
        urls.map(url => fetch(url))
    );
    res.json({status:"ok"});
});
const PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, ()=>{
  console.log(`Auth service running on port ${PORT}`)
})
