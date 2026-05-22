import mongoose from "mongoose";
import dotenv from "dotenv";
import Rider from "./services/rider/src/models/rider.js";

dotenv.config({ path: "./services/rider/.env" });

const checkRiders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const riders = await Rider.find({});
        console.log("Riders in DB:", JSON.stringify(riders, null, 2));
        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
};

checkRiders();
