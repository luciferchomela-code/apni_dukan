import mongoose from "mongoose";
import dotenv from "dotenv";
import { join } from "path";

// Load env from rider service
dotenv.config({ path: "./services/rider/.env" });

const verifyRiders = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not found in env");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const RiderSchema = new mongoose.Schema({
            isVerified: Boolean
        });
        const Rider = mongoose.models.Rider || mongoose.model("Rider", RiderSchema);

        const result = await Rider.updateMany({}, { $set: { isVerified: true } });
        console.log(`Successfully verified ${result.modifiedCount} riders.`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error verifying riders:", error.message);
        process.exit(1);
    }
};

verifyRiders();
