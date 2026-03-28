import asyncHandler from "../middlewares/trycatch.js";
import shopItemModel from "../models/shopItem.model.js";
import shopModel from "../models/shop.model.js";
import getBuffer from "../config/datauri.js";
import axios from "axios";

export const addItem = asyncHandler(async(req,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Please login"
        })
    }
    const shop = await shopModel.findOne({ownerId:req.user._id})
    if(!shop){
        return res.status(404).json({
            message:"Shop not found"
        })
    }
    const {name,description,price} = req.body;
    if(!name || !price){
        return res.status(400).json({
            message:"name and price are required"
        })
    }
    const file = req.file;
    if(!file){
        return res.status(400).json({
            message:"Please upload an image"
        })
    }
    const fileBuffer = getBuffer(file);
    if(!fileBuffer?.content){
        return res.status(500).json({
            message:"Failed to process image"
        })
    }
    const {data:uploadResult} = await axios.post(
        `${process.env.UTILS_SERVICE}/api/upload`,
        {buffer:fileBuffer.content}
    )
    const newItem = await shopItemModel.create({
        name,
        description,
        price,
        image:uploadResult.url,
        shopId:shop._id,
        ownerId:req.user._id
    })
    
    console.log(newItem)

    return res.status(201).json({
        message:"Item added successfully",
        item:newItem,
    })
})
export const getAllItems = asyncHandler(async(req,res)=>{
    const {id} =req.params;
    if(!id){
        return res.status(400).json({
            message:"Please provide shop id"
        })
    }
    const items = await shopItemModel.find({shopId:id})
    return res.status(200).json({
        message:"Items fetched successfully",
        items,
    })
})
export const deleteItem = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Please login" });
    }

    const { itemId } = req.params; 
    
    // Find item by ID first
    const item = await shopItemModel.findById(itemId);

    if (!item) {
        return res.status(404).json({
            message: "Item not found"
        });
    }

    // Verify ownership safely using string comparison
    if (item.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: "You don't have permission to delete this item"
        })
    }

    await item.deleteOne();

    return res.status(200).json({
        message: "Item deleted successfully"
    });
});

export const toggleItemAvailability = asyncHandler(async(req,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"Please login"
        })
    }
    const { itemId } = req.params;
    
    // Find the item first to check existence
    const item = await shopItemModel.findById(itemId);
    
    if(!item){
        return res.status(404).json({
            message:"Item not found"
        })
    }

    // Verify ownership safely using string comparison
    if (item.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: "You don't have permission to modify this item"
        })
    }

    item.isAvailable = !item.isAvailable;
    await item.save();
    
    return res.status(200).json({
        message:`Item is now ${item.isAvailable ? 'visible' : 'hidden'}`,
        item,
    })
})