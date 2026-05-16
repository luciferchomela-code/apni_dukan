import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./src/config/db.js";

import router from "./src/routes/shop.route.js";
import itemRouter from "./src/routes/Item.route.js";
import cartRouter from "./src/routes/cart.route.js";
import addressRouter from "./src/routes/address.js";
import orderRouter from "./src/routes/order.js";

import { connectRabbitMQ } from "./src/config/rabbitmq.js";
import { startPaymentConsumer } from "./src/controllers/payment.consumer.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));

const PORT = process.env.PORT || 5001;

app.use("/api/shop", router);

app.use("/api/item", itemRouter);

app.use("/api/cart", cartRouter);

app.use("/api/address", addressRouter);

app.use("/api/order", orderRouter);

connectDB();

await connectRabbitMQ();

await startPaymentConsumer();

app.listen(PORT, () => {
    console.log(`Shop service running on port ${PORT}`);
});