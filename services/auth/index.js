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

const PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, ()=>{
  console.log(`Auth service running on port ${PORT}`)
})