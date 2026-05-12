import dotenv from "dotenv";
dotenv.config();
import asyncHandler from "../middlewares/trycatch.js";
import shopModel from "../models/shop.model.js";
import getBuffer from "../config/datauri.js";
import axios from "axios";
import jwt from "jsonwebtoken";

export const addshop = asyncHandler(async (req,res) => {

    const user = req.user;

    if(!user){
        return res.status(401).json({message:"please login"});
    }

    const existingshop = await shopModel.findOne({ownerId:user._id});

    if(existingshop){
        return res.status(409).json({message:"the user already have one shop"});
    }

    const {
        name,
        description,
        latitude,
        longitude,
        formattedAddress,
        phone,
        shoptype
    } = req.body;

    if(!name || !latitude || !longitude || !phone || !shoptype){
        return res.status(400).json({message:"all fields are required"});
    }

    const shopimg = req.file;

    if(!shopimg){
        return res.status(400).json({message:"please upload shop image"});
    }

    const fileBuffer = getBuffer(shopimg);

    if(!fileBuffer?.content){
        return res.status(500).json({message:"failed to process image"});
    }

    const { data: uploadResult } = await axios.post(
        `${process.env.UTILS_SERVICE}/api/upload`,
        { buffer:fileBuffer.content }
    );

    const newShop = await shopModel.create({
        name,
        description,
        phone,
        shoptype,
        image:uploadResult.url,
        ownerId:user._id,
        autoLocation:{
            type:"Point",
            coordinates:[Number(longitude),Number(latitude)],
            formattedAddress,
        },
        isVerified:false,
    });

    return res.status(201).json({
        message:"shop created successfully",
        shop:newShop
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
    if (!req.user.shopId) {
        const userPayload = req.user.toObject ? req.user.toObject() : req.user;

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

export const editShop = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const shop = await shopModel.findOne({ ownerId: user._id });
    if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
    }

    const { name, description, isOpen } = req.body;
    
    if (name) shop.name = name;
    if (description) shop.description = description;
    if (isOpen !== undefined) shop.isOpen = isOpen;

    const file = req.file;
    if (file) {
        const fileBuffer = getBuffer(file);
        if (fileBuffer?.content) {
            const { data: uploadResult } = await axios.post(
                `${process.env.UTILS_SERVICE}/api/upload`,
                { buffer: fileBuffer.content }
            );
            shop.image = uploadResult.url;
        }
    }

    await shop.save();

    return res.json({ 
        message: "Shop updated successfully", 
        shop 
    });
});


export const updateStatusShop = asyncHandler(async(req,res)=>{
    const {status} =req.body;
    if(typeof status !== "boolean"){
        return res.status(400).json({message:"status is required"})
    }
    const shop = await shopModel.findOneAndUpdate(
        {ownerId:req.user._id},
        {isOpen:status},
        {returnDocument:'after'});
    if(!shop){
        return res.status(404).json({message:"Shop not found"})
    }
    return res.json({
        message:"Shop status updated successfully",
        shop
    })
})

export const getNearbyShop = asyncHandler(async(req,res)=>{
    const {latitude,longitude,radius=5000,search =""} = req.query;
    if(!latitude || !longitude){
        return res.status(400).json({message:"latitude and longitude are required"})
    }

    const query = {}
    if(search && typeof search===`string`){
       query.name = {$regex:search,$options:"i"};
    }
    const shops = await shopModel.aggregate([
        {
            $geoNear:{
                near:{
                    type:"Point",
                    coordinates:[Number(longitude),Number(latitude)]
                },
                distanceField:"distance",
                maxDistance:Number(radius),
                spherical:true,
                query:query,
            },
        },
        {
            $sort:{
                isOpen:-1,
                distance:1
            }
        },
        {
            $addFields:{
                distanceKm:{
                    $round:[
                        {
                            $divide:["$distance",1000]
                        },
                        2
                    ]
                }
            }
         },
    ])
    console.log(shops);
    res.json({
        message:"Shop fetched successfully",
        count:shops.length,
        shop:shops
    })
})

export const fetchSingleShop = asyncHandler(async(req,res)=>{
    const shop = await shopModel.findById(req.params.id);
    if(!shop){
        return res.status(404).json({message:"Shop not found"})
    }
    return res.json({
        message:"Shop fetched successfully",
        shop
    })
})


