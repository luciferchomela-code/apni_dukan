import express from "express";
import { createOrder, fetchOrderForPayment, fetchShopOrder, updateOrderStatus, getMyOrders, fetchSingleOrder, assignRiderToOrder, getCurrentOrderForRider, updateOrderStatusRider } from "../controllers/order.js"
import { isAuth, isSeller } from "../middlewares/isAuth.js";
const router = express.Router();

router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get("/my", isAuth, getMyOrders);

// Internal routes (called by rider service with x-internal-key) — must come BEFORE wildcards
router.put("/assign/rider", assignRiderToOrder);
router.get("/current/rider", getCurrentOrderForRider);
router.put("/update/rider", updateOrderStatusRider);

// Shop-owner routes
router.get("/order/:shopId", isAuth, isSeller, fetchShopOrder);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);

// Wildcard last
router.get("/:id", isAuth, fetchSingleOrder);
export default router;