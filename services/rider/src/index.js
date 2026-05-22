import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import router from "./routes/routes.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startOrderReadyConsumer } from "./config/orderReady.consumer.js";

dotenv.config();

// Initialize RabbitMQ and start consumers
await connectRabbitMQ();
await startOrderReadyConsumer();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5005;


app.use("/api",router)


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});