import { Router } from "express";
import { ForgotPassword, getCurrentUserData, loginUser, registerUser, resendOtp, ResetTokenLimite, SetSubscription, SetTokenLimite, UpadteUserDetail, uploadProfilePhoto, VerifyEmail, verifyOtp } from "../controllers/userController.js";
import { getAllPublicRepos, getFileContents,  getRepoFiles,  githubCallBack, githubRedirect } from "../controllers/githubController.js";
import { AuthMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.middleware.js";

const UserRouter = Router();

UserRouter.post("/register", registerUser);
UserRouter.post("/login" , loginUser);
UserRouter.post("/verifyOtp" , verifyOtp);
UserRouter.post("/resendOtp" , resendOtp );
UserRouter.post("/verifyEmail" , VerifyEmail)
UserRouter.post("/forgotPassword"  , ForgotPassword)
UserRouter.post("/update" ,AuthMiddleware , UpadteUserDetail)

UserRouter.post("/profilePhoto/update" , AuthMiddleware, upload.single("profilePhoto") , uploadProfilePhoto)


UserRouter.get('/github' , githubRedirect)
UserRouter.get('/github/callback' , githubCallBack)
UserRouter.get("/github/:userName/public/all-repos" , AuthMiddleware , getAllPublicRepos)
UserRouter.post("/github/public/repo/tree" , AuthMiddleware , getRepoFiles)
UserRouter.post("/github/public/repo/contents" , AuthMiddleware , getFileContents)


UserRouter.get("/getData" , AuthMiddleware , getCurrentUserData )

UserRouter.get("/resetTokenLimite" , AuthMiddleware , ResetTokenLimite)
UserRouter.get("/setTokenLimite/:tokenLimit" , AuthMiddleware , SetTokenLimite)
UserRouter.get("/setSubscribed/:isSubscribed" , AuthMiddleware , SetSubscription )

export default UserRouter;