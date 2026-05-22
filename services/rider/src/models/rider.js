import mongoose from "mongoose";

const riderSchema = new mongoose.Schema({
    user:{
        type:String,
        required:true,
        unique:true
    },
    picture:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    aadharNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    drivingLicenseNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point"
        },
        coordinates:{
            type:[Number],
            required:true,
        }
    },
    isAvailable:{
        type:Boolean,
        default:false,
    },
    lastActiveAt:{
        type:Date,
        default:Date.now,
    }
    
},{
    timestamps:true,
});
riderSchema.index({location:"2dsphere"});
const Rider = mongoose.model("Rider", riderSchema);

export default Rider;