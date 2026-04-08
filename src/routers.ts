import { Router } from "express";
import { getCurrentUserData, loginUser, registerUser, resendOtp, verifyOtp } from "./controllers/userController.js";
import { getAllPublicRepos, getFileContents,  getRepoFiles,  githubCallBack, githubRedirect } from "./controllers/githubController.js";
import { AuthMiddleware } from "./middleware/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login" , loginUser);
router.post("/verifyOtp" , verifyOtp);
router.post("/resendOtp" , resendOtp );

router.get('/github' , githubRedirect)
router.get('/github/callback' , githubCallBack)
router.get("/github/:userName/public/all-repos" , AuthMiddleware , getAllPublicRepos)
router.post("/github/public/repo/tree" , AuthMiddleware , getRepoFiles)
router.post("/github/public/repo/contents" , AuthMiddleware , getFileContents)

router.get("/getData" , AuthMiddleware , getCurrentUserData )

export default router;