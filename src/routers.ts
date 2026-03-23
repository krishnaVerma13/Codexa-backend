import { Router } from "express";
import { loginUser, registerUser, resendOtp, verifyOtp } from "./controllers/userController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login" , loginUser);
router.post("/verifyOtp" , verifyOtp);
router.post("/resendOtp" , resendOtp);

export default router;