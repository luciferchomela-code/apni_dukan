import crypto from "crypto";

export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, signature) => {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    return expectedSignature === signature;
};