import dotenv from "dotenv";
dotenv.config();
import asyncHandler from "../middlewares/trycatch.js";
import shopModel from "../models/shop.model.js";
import getBuffer from "../config/datauri.js";
import axios from "axios";
import jwt from "jsonwebtoken";

export const addshop = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "unauthorized seller" });
    }

    const existingShop = await shopModel.findOne({ ownerId: user._id });
    if (existingShop) {
        return res.status(400).json({ message: "You already have a shop registered" });
    }

    const { name, description, latitude, longitude, formattedAddress, phone, shoptype } = req.body;

    // Strict Validation
    if (!name || !latitude || !longitude || !shoptype || !phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "Please upload a shop image" });
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({ message: "Failed to process image" });
    }

    // Upload image to Utils Service
    const { data: uploadResult } = await axios.post(
        `${process.env.UTILS_SERVICE}/api/upload`,
        { buffer: fileBuffer.content }
    );

    const newShop = await shopModel.create({
        name,
        description,
        phone,
        shoptype, // Successfully saved
        image: uploadResult.url,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress,
        },
        isVerified:false,
    });

    return res.status(201).json({ 
        message: "Shop created successfully",
        shop: newShop 
    });
});

export const fetchMyShop = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Please login" });
    }

    const shop = await shopModel.findOne({ ownerId: req.user._id });

    if (!shop) {
        return res.status(404).json({ message: "No shop found" });
    }

    // Check if shopId is already in the token/user object
    if (!req.user.shopId) {
        // NUMERICAL FIX: Convert Mongoose Doc to Plain Object
        const userPayload = req.user.toObject ? req.user.toObject() : req.user;

        // Remove sensitive fields from the new token payload
        delete userPayload.password; 

        const token = jwt.sign(
            {
                user: {
                    ...userPayload,
                    shopId: shop._id,
                },
            },
            process.env.JWT_SEC,
            { expiresIn: "15d" }
        );

        return res.json({ shop, token });
    }

    return res.json({ shop });
});