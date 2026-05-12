import asyncHandler from "../middlewares/trycatch.js";
import cartModel from "../models/cart.model.js";

export const addToCart = asyncHandler(async(req,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"login first"
        })
    }
    const userId = req.user._id;
    const { shopId, itemId } = req.body;
    if(!shopId || !itemId){
        return res.status(400).json({
            message:"shopId and itemId are required"
        })
    }
    const itemfromdifferentshop = await cartModel.findOne({
        userId,
        shopId:{ $ne: shopId }
    });
    if(itemfromdifferentshop){
        return res.status(400).json({
            message:"you can order only from one shop at a time"
        })
    }
    const cartItem = await cartModel.findOneAndUpdate(
        {
            userId,
            shopId,
            itemId
        },
        {
            $inc:{ quantity:1 },
            $setOnInsert:{ userId, shopId, itemId }
        },
        {
            new:true,
            upsert:true
        }
    );
    return res.status(201).json({
        message:"item added to cart",
        cartItem
    })
})

export const fetchMyCart = asyncHandler(async(req,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"login first"
        })
    }
    const userId = req.user._id;
    const cartItems = await cartModel.find({
        userId
    })
    .populate("shopId")
    .populate("itemId");

    let subTotal = 0;
    let cartLength = 0;
    let shopLocation = null;

    if(cartItems.length > 0 && cartItems[0].shopId){
        shopLocation = cartItems[0].shopId.autoLocation || null;
    }

    for(const cartItem of cartItems){
        if(cartItem.itemId){
            subTotal += cartItem.itemId.price * cartItem.quantity;
            cartLength += cartItem.quantity;
        }
    }
    return res.status(200).json({
        cartLength,
        subTotal,
        shopLocation,
        cart:cartItems
    })
})

export const removeFromCart = asyncHandler(async(req,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"login first"
        })
    }
    const userId = req.user._id;
    const { itemId } = req.params;
    if(!itemId){
        return res.status(400).json({
            message:"enter valid input"
        })
    }
    const item = await cartModel.findOne({
        userId,
        itemId
    });
    if(!item){
        return res.status(404).json({
            message:"cart not found"
        })
    }
    if(item.quantity > 1){
        await cartModel.findOneAndUpdate(
            {
                userId,
                itemId
            },
            {
                $inc:{ quantity:-1 }
            }
        );
        return res.status(200).json({
            message:"item quantity updated"
        })
    }
    await cartModel.findOneAndDelete({
        userId,
        itemId
    });
    return res.status(200).json({
        message:"item removed successfully"
    })
})

export const deleteFromCart = asyncHandler(async(req,res)=>{
    if(!req.user){
        return res.status(401).json({
            message:"login first"
        })
    }
    const userId = req.user._id;
    const { itemId } = req.params;
    if(!itemId){
        return res.status(400).json({
            message:"enter valid input"
        })
    }
    const item = await cartModel.findOne({
        userId,
        itemId
    });
    if(!item){
        return res.status(404).json({
            message:"cart not found"
        })
    }
    await cartModel.findOneAndDelete({
        userId,
        itemId
    });
    return res.status(200).json({
        message:"item completely removed"
    })
})