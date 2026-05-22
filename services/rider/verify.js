import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const verify = async () => {
    try {
        if(!process.env.MONGO_URL) {
            console.error("No MONGO_URL in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
        
        const db = mongoose.connection.db;
        // The collection is likely "riders"
        const result = await db.collection("riders").updateMany({}, { $set: { isVerified: true } });
        console.log(`Verified ${result.modifiedCount} riders!`);
        
        process.exit(0);
    } catch(e) {
        console.error("Error:", e);
        process.exit(1);
    }
};

verify();
