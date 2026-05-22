const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env from rider service
dotenv.config({ path: path.join(__dirname, "../services/rider/.env") });

const verifyRiders = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI not found in env");
        }
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        // Define a minimal schema
        const Rider = mongoose.model("Rider", new mongoose.Schema({
            isVerified: Boolean
        }));

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
