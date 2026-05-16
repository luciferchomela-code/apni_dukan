import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import uploadRoutes from "./src/routes/cloudinary.js";
import { connectRabbitMQ } from "./src/routes/config/rabbitmq.js";
import paymentRoutes from "./src/routes/payment.js";

dotenv.config();
connectRabbitMQ();
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY, // ✅ removed unused destructuring
});

app.use("/api", uploadRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Utils service running on port ${PORT}`);
});