import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    formattedAddress:{
        type:String,
        required:true
    },
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point",
        },
        coordinates:{
            type:[Number],
            required:true
        }
    }
},{
    timestamps:true
})

addressSchema.index({ location:"2dsphere" })

const Address = mongoose.model("Address",addressSchema);

export default Address;