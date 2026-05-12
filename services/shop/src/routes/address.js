import express from 'express'
import { addAddress, deleteAddress, getUserAddresses } from '../controllers/address.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

router.post("/new",isAuth,addAddress);
router.delete("/delete/:id",isAuth,deleteAddress);
router.get("/all",isAuth,getUserAddresses);
export default router;