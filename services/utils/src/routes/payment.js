import express from "express";
import { createRazorpayOrder } from "./controllers/payment.js";
import { verifyRazorpaymentPayment } from "./controllers/payment.js";

const router = express.Router();

router.post("/create", createRazorpayOrder);
router.post("/verify", verifyRazorpaymentPayment);

export default router;