import { Router } from "express";
import { getCurrentUserData, loginUser, registerUser, resendOtp, VerifyEmail, verifyOtp } from "../controllers/userController.js";
import { getAllPublicRepos, getFileContents,  getRepoFiles,  githubCallBack, githubRedirect } from "../controllers/githubController.js";
import { AuthMiddleware } from "../middleware/authMiddleware.js";

const UserRouter = Router();

UserRouter.post("/register", registerUser);
UserRouter.post("/login" , loginUser);
UserRouter.post("/verifyOtp" , verifyOtp);
UserRouter.post("/resendOtp" , resendOtp );
UserRouter.post("/verifyEmail" , VerifyEmail)

UserRouter.get('/github' , githubRedirect)
UserRouter.get('/github/callback' , githubCallBack)
UserRouter.get("/github/:userName/public/all-repos" , AuthMiddleware , getAllPublicRepos)
UserRouter.post("/github/public/repo/tree" , AuthMiddleware , getRepoFiles)
UserRouter.post("/github/public/repo/contents" , AuthMiddleware , getFileContents)

UserRouter.get("/getData" , AuthMiddleware , getCurrentUserData )

export default UserRouter;