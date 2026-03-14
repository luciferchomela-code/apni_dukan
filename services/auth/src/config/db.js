import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URL}/Apni_dukan`);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Database connection error:", error);
        process.exit(1);
    }
};

export default connectDB;