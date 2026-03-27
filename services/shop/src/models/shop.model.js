import mongoose, { Schema } from "mongoose";

const shopSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: String,
    image: {
        type: String,
        required: true,
    },
    ownerId: {
        type: String,
        required: true,
    },
    shoptype: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String, // FIX: Changed from Number to String to prevent CastErrors
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    autoLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point" // FIX: Ensure default is set
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
        formattedAddress: {
            type: String,
        },
    },
    isOpen: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

// Important for nearby search logic
shopSchema.index({ autoLocation: "2dsphere" });

export default mongoose.model("Shop", shopSchema);