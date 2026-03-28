import express from "express";
import {isAuth,isSeller} from "../middlewares/isAuth.js"
import { addshop, fetchMyShop, editShop, updateStatusShop, getNearbyShop, fetchSingleShop } from "../controllers/shop.js";
import uploadFile from "../middlewares/multer.js"
const router = express.Router()

router.post("/new",isAuth,isSeller,uploadFile,addshop);
router.get("/my",isAuth,isSeller,fetchMyShop)
router.put("/edit", isAuth, isSeller, uploadFile, editShop);
router.put("/status",isAuth,isSeller,updateStatusShop);
router.get("/all",isAuth,getNearbyShop)
router.get("/:id",isAuth,fetchSingleShop)
export default router