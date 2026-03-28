import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    shopId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shop",
        required:true
    },
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
},{
    timestamps:true,
})

export default mongoose.model("ShopItem",schema)