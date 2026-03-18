import asyncHandler from "express-async-handler"
import type { EmailRegistrationSchemaType, GithubRegistrationSchemaType, UserLoginSchemaType } from "../validations/user.velidation.js"
import type { TUser } from "../Types.js"
import { ApiResponce } from "../utils/ApiResponce.js"
import { ApiError } from "../utils/ApiError.js"
import { userRepo } from "../repository/user.repo.js"
import bcrypt from "bcrypt"
import { JwtToken } from "../config/Jwt.js"
import { SendEmailVerifaction } from "./emailVerifaction.js"

export const userService = {
    
    // User Sign through Email and password !!!!
    async emailRegister(data : EmailRegistrationSchemaType) : Promise<ApiResponce<TUser | null> | ApiError> {
        const userExist = await userRepo.findone({email : data.email});
        console.log("userExist : ",userExist);
        
        if(userExist.statusCode == 200){
            return new ApiError(409 , "Email allready existed ")
        }
        const hashpass = await bcrypt.hash(data.password , 10);
        // console.log("hash password :", hashpass);
        const upUser = { ...data , password : hashpass}
        
        const userdata = await userRepo.createUser(upUser);
        console.log("create user responce :", userdata);
        
        if(userdata.success == false){
            return new ApiError(userExist.statusCode , userExist.message)
        }
        const sendVerificationResult = await SendEmailVerifaction(
                {email : userdata.data?.email! , username: userdata.data?.name!}
            )
            // return new ApiResponce(userdata.statusCode , userdata.message , userdata.data)
        
            return new ApiResponce(sendVerificationResult.statusCode ,sendVerificationResult.message,null)

    },

    
    
    
    
    
    
    // async githubRegister(data : GithubRegistrationSchemaType) : Promise<ApiResponce<TUser> | ApiError> {
    //     const userExist = await userRepo.findone({email : data.email});
    //     if(userExist.success == false){
    //         return new ApiError(userExist.statusCode , userExist.message)
    //     }
        
    //     const userdata = await userRepo.createUser(data);
    //     if(userdata.success == false){
    //         return new ApiError(userExist.statusCode , userExist.message)
    //     }
        
    //     return new ApiResponce(userdata.statusCode , userdata.message , userdata.data)
    // } 

    
    
    
    
    // User Login Login through Email !!!
    async userLogin(data : UserLoginSchemaType): Promise<ApiResponce<string | null> | ApiError> {
        const userExist = await userRepo.findone({email : data.email});
        // console.log("userExist : ",userExist);
        
        if(userExist.statusCode != 200){
            return new ApiError(userExist.statusCode , userExist.message)
        }
        if(!data.password || !userExist.data!.password!){
            return new ApiResponce(404 , " password not found for hash compare !!" , null)
        }
        const hashpassword = await bcrypt.compare(data.password , userExist.data!.password!) 
        // console.log("harshpassword :",hashpassword);
        
        if(hashpassword){
            const sendVerificationResult = await SendEmailVerifaction(
                {email : userExist.data?.email! , username: userExist.data?.name!}
            )

            // const token = await JwtToken.generateToken({userId: userExist.data!._id!})
            // return new ApiResponce(sendVerificationResult.statusCode ,sendVerificationResult.message,null)
        }
        return new ApiError(400 , "Incurrect password")
    },
    
    async verifyEmailOTP(email: string , userOTP: number): Promise<ApiResponce<null> | ApiError>{
        const userExist = await userRepo.findone({email : email});
        // console.log("userExist : ",userExist);
        
        if(userExist.statusCode != 200){
            return new ApiError(userExist.statusCode , userExist.message)
        }
        if(userExist.data?.emailOTP == userOTP){
            return new ApiResponce(200 , "OTP verified successfully" , null)
        }else{
            return new ApiError(400 , "Invalid OTP")
        }
    }
}
