import express from "express";
import {isAuth,isSeller} from "../middlewares/isAuth.js"
import { addshop, fetchMyShop } from "../controllers/shop.js";
import uploadFile from "../middlewares/multer.js"
const router = express.Router()

router.post("/new",isAuth,isSeller,uploadFile,addshop);
router.get("/my",isAuth,isSeller,fetchMyShop)


export default router