import asyncHandler from "../middlewares/trycatch.js";
import Cart from "../models/cart.model.js";

export const addToCart = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }
    const userId = req.user._id;
    const { shopId, itemId } = req.body;

    if (!shopId || !itemId) {
        return res.status(400).json({
            message: "shopId and itemId are required"
        })
    }

    // Checking if trying to shop from a different shop
    const existingOtherShopCart = await Cart.findOne({
        userId,
        shopId: { $ne: shopId },
    })
    
    if (existingOtherShopCart) {
        return res.status(400).json({
            message: "you can order only from one shop at time"
        })
    }

    const cartItem = await Cart.findOneAndUpdate({
        userId,
        shopId,
        itemId
    }, {
        $inc: { quantity: 1 },
        $setOnInsert: { userId, shopId, itemId },
    }, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    })

    return res.status(201).json({
        message: "item added to cart",
        cartItem
    })
})

export const fetchMyCart = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }
    const userId = req.user._id;
    const cart = await Cart.find({
        userId
    }).populate("shopId")
    .populate("itemId")
    
    let subTotal = 0;
    let cartLength = 0;
    for (const item of cart) {
        if (item.itemId && item.itemId.price) {
            subTotal += item.itemId.price * item.quantity;
            cartLength += item.quantity;
        }
    }
    
    return res.status(200).json({
        message: "cart fetched successfully",
        cart,
        subTotal,
        cartLength
    })
})

export const removeFromCart = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }
    const userId = req.user._id;
    const { itemId } = req.params;

    const cartItem = await Cart.findOne({ userId, itemId });
    if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
    }

    if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        await cartItem.save();
    } else {
        await Cart.findByIdAndDelete(cartItem._id);
    }

    return res.status(200).json({
        message: "Item quantity updated",
    });
})

export const deleteFromCart = asyncHandler(async(req,res)=>{
    if(!req.user) return res.status(401).json({message:"login first"})
    await Cart.findOneAndDelete({userId:req.user._id,itemId:req.params.itemId})
    return res.status(200).json({message:"item deleted from cart"})
})