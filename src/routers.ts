import { Router } from "express";
import { loginUser, registerUser, verifyOtp } from "./controllers/userController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login" , loginUser);
router.post("/verifyOtp" , verifyOtp);

export default router;