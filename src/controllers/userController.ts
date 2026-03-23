import asyncHandler from "express-async-handler"
import type { Request, Response } from "express"
import { ApiResponce } from "../utils/ApiResponce.js"
import { ApiError } from "../utils/ApiError.js"
import { registerSchema, userLoginSchema } from "../validations/user.velidation.js"
import { userService } from "../services/user.service.js"
import { success, ZodError } from "zod"



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
        // console.log("controller otp : ",typeof(userOtp));

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
