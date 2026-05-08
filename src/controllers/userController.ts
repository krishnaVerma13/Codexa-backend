import asyncHandler from "express-async-handler"
import type { Request, Response } from "express"
import { ApiResponce } from "../utils/ApiResponce.js"
import { ApiError } from "../utils/ApiError.js"
import { registerSchema, userLoginSchema } from "../validations/user.velidation.js"
import { userService } from "../services/user.service.js"
import { success, ZodError } from "zod"
import cloudinary from "../config/cloudinary.js"
import { Readable } from "node:stream"
import { userRepo } from "../repository/user.repo.js"
import mongoose from "mongoose"



export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);

        if (data.authType === "email") {
            const resp = await userService.emailRegister(data)
            res.status(resp.statusCode).json({ success: resp.success, message: resp.message });
            return;

        } else if (data.authType === "github") {
            // const resp 
            // res.status(resp.statusCode).json({ success: resp.success, message: resp.message })
        }

    } catch (error) {
        if (error instanceof ZodError) {
            const err = error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));

            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: err
            });
            return;
        }

    throw error;
}
})

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const data = userLoginSchema.parse(req.body);
        
        const resp = await userService.userLogin(data)
        
        res.status(resp.statusCode).json({success : resp.success , message : resp.message , data : resp.data})

    } catch (error) {
        if (error instanceof ZodError) {
            const err = error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));

            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: err
            });
            return;
        }

    throw error;
}
})


export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const userOtp = parseInt(otp);        
        console.log("controller email : ",email);
        const resp = await userService.verifyEmailOTP(email , userOtp)
        res.status(resp.statusCode).json({success : resp.success , message : resp.message })
    } catch (error) {
        if (error instanceof ZodError) {
            const err = error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: err
            });
            return;
        }
        throw error;
    }
    })
    


    export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const resp = await userService.reSendOTP(email)
        res.status(resp.statusCode).json({success : resp.success , message : resp.message })
    } catch (error) {
        if (error instanceof ZodError) {
            const err = error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: err
            });
            return;
        }
    throw error;
}
})

export const getCurrentUserData = asyncHandler(async(req : Request , res : Response)=>{
    try {
        const user = req.user;
        console.log("call api :");
        
        const resp = await userService.getUserData(user?.userId!)
        res.status(resp.statusCode).json({success : resp.success , message : resp.message , data : resp.data })
        
    } catch (error) {
        if (error instanceof ZodError) {
            const err = error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: err
            });
            return;
        }
    throw error;
    }
})


export const VerifyEmail = asyncHandler(async(req : Request , res : Response)=>{
    try {
        const {email} =  req.body
        if(!email){
             res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        const resp = await userService.userVerifyEmail(email)
            res.status(resp.statusCode).json({ success: resp.success, message: resp.message });
          
           
        } catch (error) {
            if (error instanceof ZodError) {
                const err = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message
                }));
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: err
                });
                return;
            }
        throw error;
    }
})


export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }
    console.log("req file :",req.file);
    
    const userId = req.user?.userId; // from auth middleware

    // stream buffer → cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `codexa/avatars`,
          public_id: `user_${userId}`,   // consistent ID = auto-overwrites old photo
          overwrite: true,
          transformation: [
            { width: 256, height: 256, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      Readable.from(req.file!.buffer).pipe(stream);
    });
    console.log("upload responce :",uploadResult);
    
    // save URL to db
    const updated = await userRepo.updateUser({
      filter :{ _id : userId},
      update:{ userProfile: uploadResult.secure_url }
    }
    );

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      data: { userProfile: updated?.data?.userProfile },
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Upload failed", error });
  }
};



export const UpadteUserDetail = asyncHandler(async(req : Request , res : Response)=>{
    try {
        const {data} =  req.body;
        const id = req.user?.userId;
        console.log("data :",data ," id :",id);
        
        if(!data || !id){
             res.status(400).json({
                success: false,
                message: "Data not found",
            });
        }
        const resp = await userService.updateUserData(id! , data)
            res.status(resp.statusCode).json({ success: resp.success, message: resp.message });
          
           
        } catch (error) {
            if (error instanceof ZodError) {
                const err = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message
                }));
                res.status(400).json({
                    success: false,
                    message: "Updation failed",
                    errors: err
                });
                return;
            }
        throw error;
    }
})

export const ForgotPassword = asyncHandler(async(req : Request , res : Response)=>{
    try {
        const {data} =  req.body;
        console.log("data :",data);
        
        if(!data.email || !data.password){
             res.status(400).json({
                success: false,
                message: "Data not found",
            });
        }
        const resp = await userService.forgotPassword(data.email , data.password)
            res.status(resp.statusCode).json({ success: resp.success, message: resp.message });
          
           
        } catch (error) {
            if (error instanceof ZodError) {
                const err = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message
                }));
                res.status(400).json({
                    success: false,
                    message: "Updation failed",
                    errors: err
                });
                return;
            }
        throw error;
    }
})


export const ResetTokenLimite = asyncHandler(async(req : Request , res : Response)=>{
    try {
        console.log("CAll Resert token limite ");
        
        const userID =  req.user?.userId;
        const objectId = new mongoose.Types.ObjectId(userID);

        const resp = await userService.resetTokenLimite(objectId)
            res.status(resp.statusCode).json({ success: resp.success, message: resp.message });
          
           
        } catch (error) {
            if (error instanceof ZodError) {
                const err = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message
                }));
                res.status(400).json({
                    success: false,
                    message: "Updation failed",
                    errors: err
                });
                return;
            }
        throw error;
    }
})

export const SetTokenLimite = asyncHandler(async(req : Request , res : Response)=>{
    try {
        console.log("CAll Sert token limite ");
        
        const userID =  req.user?.userId;
        const tokenLimite = Number(req.params?.tokenLimit);
        console.log(req.params.tokenLimit);
        
        const objectId = new mongoose.Types.ObjectId(userID);

        if(!tokenLimite){
            res.status(400).json({success : false , message : "token limite is missing "})
            return
        }

        const resp = await userService.SetTokenLimite(objectId , tokenLimite)
            res.status(resp.statusCode).json({ success: resp.success, message: resp.message });
          
           
        } catch (error) {
            if (error instanceof ZodError) {
                const err = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message
                }));
                res.status(400).json({
                    success: false,
                    message: "Updation failed",
                    errors: err
                });
                return;
            }
        throw error;
    }
})

export const SetSubscription = asyncHandler(async(req : Request , res : Response)=>{
    try {
        console.log("CAll Sert Subscription ");
        
        const userID =  req.user?.userId;
        const isSubscribed = req.params.isSubscribed;
        const objectId = new mongoose.Types.ObjectId(userID);
        const value = isSubscribed === "true" ? true : false;
        console.log(isSubscribed);
        

        const resp = await userService.SetSubscription(objectId , value )
            res.status(resp.statusCode).json({ success: resp.success, message: resp.message });
          
           
        } catch (error) {
            if (error instanceof ZodError) {
                const err = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message
                }));
                res.status(400).json({
                    success: false,
                    message: "Updation failed",
                    errors: err
                });
                return;
            }
        throw error;
    }
})