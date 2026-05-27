import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { addRiderProfile, fetchMyProfile, toggleRiderAvailablity, acceptOrder, fetchCurrentOrder, updateOrderStatus, fetchPendingOrders } from "../controllers/rider.js";
import uploadFile from "../middlewares/multer.js";
const router = express.Router();

router.post("/add-profile", isAuth, uploadFile, addRiderProfile)
router.get("/myprofile", isAuth, fetchMyProfile)
router.patch("/toggle", isAuth, toggleRiderAvailablity)
router.post("/accept/:orderId", isAuth, acceptOrder)
router.get("/order/pending", isAuth, fetchPendingOrders)
router.get("/order/current", isAuth, fetchCurrentOrder)
router.put("/order/update/:orderId", isAuth, updateOrderStatus)
export default router;