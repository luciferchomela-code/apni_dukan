import axios from "axios";
import razorpay from "../config/razorpay.js";
import { verifyRazorpaySignature } from "../config/verifyrazorpay.js";
import { publishPaymentSuccess } from "../config/payment.producer.js";

export const createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        const { data } = await axios.get(
            `${process.env.SHOP_SERVICE}/api/order/payment/${orderId}`,
            {
                headers: {
                    "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
                },
            }
        );

        const options = {
            amount: Math.round(data.totalAmount * 100),
            currency: "INR",
            receipt: orderId,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            razorpayOrderId: razorpayOrder.id,
            key: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating Razorpay order",
            error: error.message,
        });
    }
};

export const verifyRazorpaymentPayment = async (req, res) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId
    } = req.body;

    const isValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isValid) {
        return res.status(400).json({
            message: "Payment verification failed"
        });
    }

    await publishPaymentSuccess(
        { status: "paid" },
        orderId,
        razorpay_payment_id,
        "RAZORPAY"
    );

    res.json({
        message: "Payment successful"
    });
};