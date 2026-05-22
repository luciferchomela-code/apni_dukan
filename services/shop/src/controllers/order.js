import mongoose from "mongoose";
import asyncHandler from "../middlewares/trycatch.js";
import axios from "axios";

import Address from "../models/address.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.js";
import Shop from "../models/shop.model.js";
import publishEvent from "../config/order.publisher.js";

export const createOrder = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const { paymentMethod, addressId, distance } = req.body;

    if (!addressId) {
        return res.status(400).json({
            message: "Address ID is required",
        });
    }

    const address = await Address.findOne({
        _id: addressId,
        userId: user._id,
    });

    if (!address) {
        return res.status(404).json({
            message: "Address not found",
        });
    }

    const parsedDistance = Number(distance);

    if (isNaN(parsedDistance) || parsedDistance < 0) {
        return res.status(400).json({
            message: "Invalid distance",
        });
    }

    const cartItems = await Cart.find({
        userId: user._id,
    })
        .populate("itemId")
        .populate("shopId");

    if (cartItems.length === 0) {
        return res.status(400).json({
            message: "Your cart is empty",
        });
    }

    const uniqueShopIds = [
        ...new Set(
            cartItems.map((item) =>
                item.shopId?._id.toString()
            )
        ),
    ];

    if (uniqueShopIds.length > 1) {
        return res.status(400).json({
            message:
                "You can order from only one shop at a time",
        });
    }

    const shop = cartItems[0].shopId;

    if (!shop) {
        return res.status(404).json({
            message: "Shop not found",
        });
    }
    if (!shop.isOpen) {
        return res.status(400).json({
            message: "Shop is currently closed",
        });
    }

    // Prepare order items
    let subtotal = 0;

    const orderItems = cartItems.map((cartItem) => {
        const product = cartItem.itemId;

        if (!product) {
            throw new Error("Product data missing");
        }

        // Stock validation
        if (product.inStock === false) {
            throw new Error(
                `${product.name} is out of stock`
            );
        }

        const itemTotal =
            product.price * cartItem.quantity;

        subtotal += itemTotal;

        return {
            itemId: product._id,
            name: product.name,
            price: product.price,
            quantity: cartItem.quantity,
        };
    });

    // Pricing calculations
    const deliveryFee = Math.ceil(parsedDistance * 5);

    const platformFee = Number(
        (subtotal * 0.05).toFixed(2)
    );

    const totalAmount = Number(
        (
            subtotal +
            deliveryFee +
            platformFee
        ).toFixed(2)
    );
    const riderAmount =
        Math.ceil(parsedDistance) * 15;

    const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000
    );

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const [order] = await Order.create(
            [
                {
                    userId: user._id,

                    shopId: shop._id,
                    shopName: shop.name,

                    distance: parsedDistance,
                    riderAmount,

                    items: orderItems,

                    subtotal,
                    deliveryFee,
                    platformFee,
                    totalAmount,

                    deliveryAddress: {
                        formattedAddress:
                            address.formattedAddress,

                        mobile: address.mobile,

                        longitude:
                            address.location.coordinates[0],

                        latitude:
                            address.location.coordinates[1],
                    },

                    paymentMethod,

                    status: "placed",

                    expiresAt,
                },
            ],
            { session }
        );

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Order created successfully",

            orderId: order._id,

            pricing: {
                subtotal,
                deliveryFee,
                platformFee,
                totalAmount,
            },
        });
    } catch (error) {
        await session.abortTransaction();

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        session.endSession();
    }
});

export const fetchOrderForPayment = asyncHandler(async(req,res)=>{
    if(req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY){

        return res.status(401).json({

            message:"Forbidden"

        })

    }

    const order = await Order.findById(req.params.id);
    if(!order){

        return res.status(404).json({
            message:"Order not found",
        })
    }
    if(order.paymentStatus !== "pending"){
        return res.status(400).json({
            message:"Order is already paid",
        })
    }
    return res.json({
        orderId:order._id.toString(),
        totalAmount:order.totalAmount,
        currency:"INR",
    })

});

export const fetchShopOrder = asyncHandler(async(req,res)=>{
    const user = req.user;
    const {shopId} = req.params;
    if(!shopId){
        return res.status(400).json({
            message:"Shop ID is required",
        })
    }
    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }
    const {limit=10} = req.query.limit ? Number(req.query.limit) : 0;
    const orders = await Order.find({
        shopId:shopId,
        paymentStatus:"paid"
    }).sort({
        createdAt:-1,
    }).limit(limit);
    return res.json({
        success:true,
        count:orders.length,
        orders,
    })
})
const ALLOWED_STATUS = ["accepted","preparing","ready_for_rider"];
export const updateOrderStatus = asyncHandler(async(req,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }
    const {orderId} = req.params;
    const {status}= req.body;
    if(!ALLOWED_STATUS.includes(status)){
        return res.status(400).json({
            message:"Invalid status",
        })
    }
    const order = await Order.findById(orderId);
    if(!order){
        return res.status(404).json({
            message:"Order not found",
        })
    }
    if(order.paymentStatus !== "paid"){
        return res.status(400).json({
            message:"Order is not paid yet",
        })
    }
    const shop = await Shop.findById(order.shopId);
    if(!shop){
        return res.status(404).json({
            message:"Shop not found",
        })
    }
    if(shop.ownerId !== user._id.toString()){
        return res.status(403).json({
            message:"Forbidden",
        })
    } 
    order.status = status;
    await order.save();
    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,{
        event:"order_update",
        payload:{
            orderId:order._id.toString(),
            status:order.status,
        },
        rooms:[`user:${order.userId}`]
    },{
        headers:{
            "x-internal-key":process.env.INTERNAL_SERVICE_KEY,
        },
    });

    if(status==="ready_for_rider"){
        console.log("emit rdy for rider",order._id.toString());
        if(!shop.autoLocation || !shop.autoLocation.coordinates){
            console.error("Shop has no autoLocation, cannot search riders");
            return res.status(400).json({
                message:"Shop location is missing. Please update your shop location."
            });
        }
        publishEvent("ORDER_READY_FOR_RIDER",{
            orderId:order._id.toString(),
            shopId:shop._id.toString(),
            location:shop.autoLocation,
            order: order,
        });

    }
    
    return res.json({
        message:"Order status updated successfully",
        order:order,
    })

})

export const getMyOrders = asyncHandler(async(req,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized", 
        })
    }
    const {limit=10} = req.query.limit ? Number(req.query.limit) : 0;
    const orders = await Order.find({
        userId:user._id,
        paymentStatus:"paid"
    }).sort({
        createdAt:-1,
    })
    return res.json({
        orders,
    })
})

export const fetchSingleOrder = asyncHandler(async(req,res)=>{
    const user = req.user;
    if(!user){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if(!order){
        return res.status(404).json({
            message:"Order not found",
        })
    }
    if(order.userId.toString() !== user._id.toString()){
        return res.status(403).json({
            message:"Forbidden",
        })
    }
    return res.json({
        order,
    })
})

export const assignRiderToOrder = asyncHandler(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const { orderId, riderId, riderName, riderPhone } = req.body;

    // Atomically assign rider only if not already assigned
    const orderUpdated = await Order.findOneAndUpdate(
        { _id: orderId, riderId: { $exists: false } },
        {
            riderId,
            riderName,
            riderPhone,
            status: "rider_assigned",
        },
        { new: true }
    );

    if (!orderUpdated) {
        return res.status(400).json({
            message: "Rider is already assigned or order not found",
        });
    }

    // Notify Shop
    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
        event: "rider_assigned",
        room: `shop:${orderUpdated.shopId}`,
        payload: orderUpdated,
    }, {
        headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY },
    });

    // Notify User
    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
        event: "rider_assigned",
        room: `user:${orderUpdated.userId}`,
        payload: orderUpdated,
    }, {
        headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY },
    });

    res.json({
        message: "Rider assigned to order successfully",
        success: true,
        order: orderUpdated,
    });
});

export const getCurrentOrderForRider = asyncHandler(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const { riderId } = req.query;
    if (!riderId) {
        return res.status(400).json({
            message: "Rider ID is required",
        });
    }
    const order = await Order.findOne({ riderId: riderId, status: { $ne: "delivered" } }).populate("shopId");
    if (!order) {
        return res.status(404).json({
            message: "No order found for this rider",
        });
    }
    return res.json({
        order,
    });
});

export const updateOrderStatusRider = asyncHandler(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({
            message: "Order ID is required",
        });
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({
            message: "No order found",
        });
    }

    let newStatus = "";
    let eventName = "";

    if (order.status === "rider_assigned") {
        newStatus = "picked_up";
        eventName = "order:picked_up";
    } else if (order.status === "picked_up") {
        newStatus = "delivered";
        eventName = "order:delivered";
    } else {
        return res.status(400).json({
            message: `Cannot update status from ${order.status}`,
        });
    }

    order.status = newStatus;
    await order.save();

    // Notification payloads
    const notificationPayload = {
        event: eventName,
        payload: order,
    };

    // Notify shop and user
    const rooms = [`shop:${order.shopId}`, `user:${order.userId}`];

    for (const room of rooms) {
        await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            ...notificationPayload,
            room: room,
        }, {
            headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY },
        }).catch(err => console.error(`Failed to emit to ${room}:`, err.message));
    }

    return res.json({
        message: "Order status updated successfully",
        success: true,
        order: order,
    });
});