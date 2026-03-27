// src/routes/cloudinary.js
import express from "express";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
    try {
        const { buffer } = req.body;
        
        if (!buffer) {
            return res.status(400).json({ message: "No image data provided" });
        }

        // FIX: The 'buffer' variable from shop-service is already a DataURI string.
        // We pass it directly to Cloudinary.
        const cloud = await cloudinary.uploader.upload(buffer, {
            resource_type: "auto" 
        });

        res.json({ url: cloud.secure_url });
    } catch (error) {
        // This will now log the EXACT reason Cloudinary failed in your terminal
        console.error("Cloudinary Upload Error:", error.message);
        res.status(500).json({ 
            message: "Upload failed", 
            error: error.message 
        });
    }
});

export default router;