import axios from "axios";
import Rider from "../models/rider.js";
import asyncHandler from "../middlewares/trycatch.js";
import getBuffer from "../config/datauri.js";

export const addRiderProfile = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    if (user.role !== "rider") {
        return res.status(403).json({
            message: "You are not a rider"
        });
    }

    const file = req.file;

    if (!file) {
        return res.status(400).json({
            message: "Please upload a profile picture"
        });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
        return res.status(400).json({
            message: "Please upload a valid file"
        });
    }

    const { data: uploadResult } = await axios.post(
        `${process.env.UTILS_SERVICE}/api/upload`,
        {
            buffer: fileBuffer.content
        }
    );

    const {
        phoneNumber,
        aadharNumber,
        drivingLicenseNumber,
        latitude,
        longitude
    }=req.body;

    if (
        !phoneNumber ||
        !aadharNumber ||
        !drivingLicenseNumber ||
        !latitude ||
        !longitude
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const existingProfile = await Rider.findOne({
        user: user._id
    });

    if (existingProfile) {
        return res.status(400).json({
            message: "Rider profile already exists"
        });
    }

    const rider = await Rider.create({
        user: user._id,
        picture: uploadResult.url,
        phoneNumber,
        aadharNumber,
        drivingLicenseNumber,
        location: {
            type: "Point",
            coordinates: [longitude, latitude]
        },
        isAvailable: false,
        isVerified: false
    });

    return res.status(201).json({
        message: "Rider profile added successfully",
        rider
    });
});

export const fetchMyProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    
    const account = await Rider.findOne({
        user: user._id
    });
    
    return res.json(account);
});
export const toggleRiderAvailablity = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    if (user.role !== "rider") {
        return res.status(403).json({
            message: "You are not a rider"
        });
    }
    
    const { isAvailable, latitude, longitude } = req.body;

    if (typeof isAvailable !== "boolean") {
        return res.status(400).json({
            message: "isAvailable must be boolean"
        });
    }
    
    if (!latitude || !longitude) {
        return res.status(400).json({ 
            message: "location is req",
        });
    }
    const rider = await Rider.findOne({
        user: user._id,
    });
    
    if (!rider) {
        return res.status(400).json({ 
            message: "Rider not found",
        });
    }
    rider.isAvailable = isAvailable;
    rider.location = {
        type: "Point",
        coordinates: [longitude, latitude]
    };
    rider.lastActiveAt = new Date();
    await rider.save();

    return res.json({
        rider,
    });
});

export const acceptOrder = asyncHandler(async (req, res) => {
    const riderUserId = req.user;
    const { orderId } = req.params;
    if (!riderUserId) {
        return res.status(400).json({
            message: "Unauthorized"
        });
    }
    const rider = await Rider.findOne({
        user: riderUserId._id || riderUserId
    });
    if (!rider) {
        return res.status(404).json({
            message: "Rider not found"
        });
    }
    try {
        const {data} = await axios.put(
            `${process.env.SHOP_SERVICE}/api/order/assign/rider`,
            {
                orderId,
                riderId: rider._id,
                riderUserId: rider.user,
                riderName: req.user?.name || "Rider",
                riderPhone: rider.phoneNumber,
            },{
                headers: {
                    "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
                },
            }
        );
        if(data.success){
            const riderDetails = await Rider.findOneAndUpdate(
                {user:riderUserId._id || riderUserId},
                {
                    isAvailable:false,
                },
                {new:true}
            );
            return res.json({
                success:true,
                message:"Order accepted successfully",
                riderDetails,
            });
        }
        return res.json(data);
    } catch (error) {
        res.json({
            success:false,
            message:error.response?.data?.message || error.message,
        });
    }
});
export const fetchCurrentOrder = asyncHandler(async (req, res) => {
    const riderUserId = req.user;
    if (!riderUserId) {
        return res.status(400).json({
            message: "Unauthorized"
        });
    }
    const rider = await Rider.findOne({
        user: riderUserId._id || riderUserId
    });
    if (!rider) {
        return res.status(404).json({
            message: "Rider not found"
        });
    }
    try {
        const {data} = await axios.get(
            `${process.env.SHOP_SERVICE}/api/order/current/rider?riderId=${rider._id}`,
            {
                headers: {
                    "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
                },
            }
        );
        return res.json({order:data,});
    } catch (error) {
        res.json({
            success:false,
            message:error.response?.data?.message || error.message,
        });
    }
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const riderUserId = req.user;
    const { orderId} = req.params;
    if (!riderUserId) {
        return res.status(400).json({
            message: "Unauthorized"
        });
    }
    const rider = await Rider.findOne({
        user: riderUserId._id || riderUserId
    });
    if (!rider) {
        return res.status(404).json({
            message: "Rider not found"
        });
    }
    try {
        const {data} = await axios.put(
            `${process.env.SHOP_SERVICE}/api/order/update/rider`,
            {
                orderId,
            },{
                headers: {
                    "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
                },
            }
        );
        return res.json({message:data.message,});
    } catch (error) {
        res.json({
            success:false,
            message:error.response?.data?.message || error.message,
        });
    }
});

export const fetchPendingOrders = asyncHandler(async (req, res) => {
    const riderUserId = req.user;
    if (!riderUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const rider = await Rider.findOne({ user: riderUserId._id || riderUserId });
    if (!rider) {
        return res.status(404).json({ message: "Rider not found" });
    }
    if (!rider.isAvailable) {
        // Rider not available - return empty list (not an error)
        return res.json({ success: true, count: 0, orders: [] });
    }
    try {
        const [longitude, latitude] = rider.location?.coordinates || [];
        const url = latitude && longitude
            ? `${process.env.SHOP_SERVICE}/api/order/pending/rider?latitude=${latitude}&longitude=${longitude}&maxDistance=100000`
            : `${process.env.SHOP_SERVICE}/api/order/pending/rider`;

        const { data } = await axios.get(url, {
            headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY },
        });
        return res.json(data);
    } catch (error) {
        return res.json({ success: false, message: error.message, orders: [] });
    }
});
