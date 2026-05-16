import mongoose from "mongoose";
import asyncHandler from "../middlewares/trycatch.js";

import Address from "../models/address.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.js";

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
        Math.ceil(parsedDistance) * 17;

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
    const {orderId} = req.params.id;
    const order = await Order.findById(orderId);
    if(!order){
        return res.status(404).json({
            message:"Order not found",
        })
    }
    if(order.userId !== user._id.toString()){
        return res.status(403).json({
            message:"Forbidden",
        })
    }
    return res.json({
        order,
    })
})