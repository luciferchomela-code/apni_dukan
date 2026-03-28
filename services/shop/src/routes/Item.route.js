import express from "express";
import { addItem, deleteItem, getAllItems, toggleItemAvailability } from "../controllers/shopItem.controller.js";
import upload from "../middlewares/multer.js";
import { isAuth, isSeller } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/new",isAuth,isSeller,upload,addItem);
router.get("/all/:id",getAllItems);
router.put("/status/:itemId",isAuth,isSeller,toggleItemAvailability);
router.delete("/:itemId",isAuth,isSeller,deleteItem);
export default router;