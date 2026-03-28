import express from "express";
import { addToCart, deleteFromCart, fetchMyCart, removeFromCart } from "../controllers/carts.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/add", isAuth, addToCart);
router.get("/all", isAuth, fetchMyCart);
router.delete("/remove/:itemId", isAuth, removeFromCart);
router.delete("/delete/:itemId", isAuth, deleteFromCart);

export default router;