import express from "express";
import { createOrder, fetchOrderForPayment } from "../controllers/order.js"
import { isAuth } from "../middlewares/isAuth.js";
import { isSeller } from "../middlewares/isSeller.js";
const router = express.Router();

router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get("/order/:shopId",isAuth,isSeller,fetchShopOrder);
router.put("/:orderId",isAuth,isSeller,updateOrderStatus);
router.get("/my",isAuth,getMyOrders);
router.get("/:id",isAuth,fetchSingleOrder);
 
export default router;