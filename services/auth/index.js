import express from 'express'
import dotenv from 'dotenv';
dotenv.config();
import connectDB from "./src/config/db.js"
import authRoute from "./src/routes/auth.route.js"

const app= express()
app.use(express.json()) 

app.use("/api/auth",authRoute)

const PORT = process.env.PORT|| 5000;

connectDB();
app.listen(PORT,()=>{
    console.log(`auth service is running on port ${PORT}`);
})