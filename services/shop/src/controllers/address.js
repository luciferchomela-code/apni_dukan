import asyncHandler from "../middlewares/trycatch.js";
import Address from "../models/address.js";

export const addAddress = asyncHandler(async (req,res) => {
    const user = req.user
    if(!user){
        return res.status(401).json({message: "unauthorized"})
    }
    const { mobile, formattedAddress, latitude, longitude } = req.body

    if(!mobile || !formattedAddress || !latitude || !longitude){
        return res.status(400).json({message: "All fields are required"})
    }
    
    const address = await Address.create({
        mobile,
        formattedAddress,
        location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)]
        },
        userId: user._id
    });

    res.status(201).json({
        success: true,
        message: "Address added successfully",
        address
    })
    
})

export const deleteAddress = asyncHandler(async (req,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({message:"unauthorized"})
    }

    const { id } = req.params;
    if(!id){
        return res.status(400).json({message:"address id is required"})
    }
    
    const address = await Address.findById(id);
    if(!address){
        return res.status(404).json({message:"address not found"})
    }

    if(address.userId.toString() !== user._id.toString()){
        return res.status(401).json({message:"unauthorized"})
    }
    
    await address.deleteOne();
    
    res.status(200).json({message:"Address deleted successfully"})
    
})

export const getUserAddresses = asyncHandler(async (req,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({message:"unauthorized"})
    }
    const addresses = await Address.find({userId: user._id})
    res.status(200).json({
        success: true,
        message: "Addresses fetched successfully",
        addresses
    })
})