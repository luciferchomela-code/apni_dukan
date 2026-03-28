import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShopItem",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
},{
    timestamps: true,
})

cartSchema.index({ userId: 1, shopId: 1, itemId: 1 }, { unique: true })

export default mongoose.model("Cart", cartSchema)