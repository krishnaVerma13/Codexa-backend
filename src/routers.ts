import { Router } from "express";
import { loginUser, registerUser, resendOtp, verifyOtp } from "./controllers/userController.js";
import { githubRedirect } from "./controllers/githubController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login" , loginUser);
router.post("/verifyOtp" , verifyOtp);
router.post("/resendOtp" , resendOtp );

router.get('/github' , githubRedirect)

export default router;