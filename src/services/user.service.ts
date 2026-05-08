import asyncHandler from "express-async-handler"
import type { EmailRegistrationSchemaType, UserLoginSchemaType } from "../validations/user.velidation.js"
import type { TUser } from "../Types.js"
import { ApiResponce } from "../utils/ApiResponce.js"
import { ApiError } from "../utils/ApiError.js"
import { userRepo } from "../repository/user.repo.js"
import bcrypt from "bcrypt"
import { JwtToken } from "../config/Jwt.js"
import { SendEmailVerifaction } from "./emailVerifaction.js"
import { file } from "zod"
import type mongoose from "mongoose"

export const userService = {

    // User Sign through Email and password !!!!
    async emailRegister(data: EmailRegistrationSchemaType): Promise<ApiResponce<TUser | null> | ApiError> {

        const userExist = await userRepo.findone({ email: data.email });
        // console.log("userExist : ", userExist);

        if (userExist.statusCode == 200) {
            return new ApiError(409, "Email allready existed ")
        }
        const hashpass = await bcrypt.hash(data.password, 10);
        // console.log("hash password :", hashpass);
        const upUser = { ...data, password: hashpass }

        const userdata = await userRepo.createUser(upUser);
        console.log("create user responce :", userdata);

        if (userdata.success == false) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        const sendVerificationResult = await SendEmailVerifaction(
            { email: userdata.data?.email!, username: userdata.data?.name! } , "verifyEmail"
        )
        // return new ApiResponce(userdata.statusCode , userdata.message , userdata.data)

        return new ApiResponce(sendVerificationResult.statusCode, sendVerificationResult.message, null)

    },





    // User Login Login through Email !!!
    async userLogin(data: UserLoginSchemaType): Promise<ApiResponce<string | null> | ApiError> {
        const userExist = await userRepo.findone({ email: data.email });
        // console.log("userExist : ",userExist);

        if (userExist.statusCode != 200) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        if (!data.password || !userExist.data!.password!) {
            return new ApiResponce(404, " password not found for hash compare !!", null)
        }
        const hashpassword = await bcrypt.compare(data.password, userExist.data!.password!)
        // console.log("harshpassword :",hashpassword);

        if (hashpassword) {
            const token = await JwtToken.generateToken({ userId: userExist.data!._id! })
            return new ApiResponce(200, "Login successful", token)
        }
        return new ApiError(400, "Incurrect password")
    },


    async userVerifyEmail(email: string): Promise<ApiResponce<null> | ApiError> {
        const userExist = await userRepo.findone({ email: email });
        // console.log("userExist : ",userExist);

        if (userExist.statusCode != 200) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        const sendVerificationResult = await SendEmailVerifaction(
            { email: email, username: userExist.data?.name! } , "resetpassword"
        )
        // return new ApiResponce(userdata.statusCode , userdata.message , userdata.data)

        return new ApiResponce(sendVerificationResult.statusCode, sendVerificationResult.message, null)


    },
    
    
    
    
    async verifyEmailOTP(email: string, userOTP: number): Promise<ApiResponce<null> | ApiError> {
        console.log("userExist : ",email , userOTP);
        const userExist = await userRepo.findone({ email: email });

        if (userExist.statusCode != 200) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        console.log("save otp :",typeof( userExist.data?.emailOTP));
        console.log("send otp :",typeof( userOTP));

        if (userExist.data?.emailOTP === userOTP) {
            const responce = await userRepo.updateUser({ filter: { email: email }, update: { emailOTP: null } })
            // console.log("responce :",responce);

            return new ApiResponce(200, "OTP verified successfully", null)
        } else {
            return new ApiError(400, "Invalid OTP")
        }
    },




    async reSendOTP(email: string): Promise<ApiResponce<null> | ApiError> {
        const userExist = await userRepo.findone({ email: email });
        // console.log("userExist : ",userExist);

        if (userExist.statusCode != 200) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        // console.log("save otp :",typeof( userExist.data?.emailOTP));
        // console.log("send otp :",typeof( userOTP));
        const sendVerificationResult = await SendEmailVerifaction(
            { email: userExist.data?.email!, username: userExist.data?.name! } , "verifyEmail"
        )
        // return new ApiResponce(userdata.statusCode , userdata.message , userdata.data)

        return new ApiResponce(sendVerificationResult.statusCode, sendVerificationResult.message, null)

    },


    async getUserData(userId: string): Promise<ApiResponce<TUser> | ApiError> {
        const userExist = await userRepo.findById(userId);
        // console.log("userExist : ",userExist);
        console.log("run get user data ");
        
        if (userExist.success == false) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        return new ApiResponce(userExist.statusCode, userExist.message, userExist.data)

    }, 

    async updateUserData(userId: string | mongoose.Types.ObjectId , update: object): Promise<ApiResponce<TUser> | ApiError> {
        const data = {
            filter : {_id : userId},
            update: update
        }

        // console.log("data :",data);
        
        const userExist = await userRepo.updateUser(data);
        // console.log("userExist : ",userExist);
        console.log("run update user data ");
        
        if (userExist.success == false) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        return new ApiResponce(userExist.statusCode, userExist.message, userExist.data)

    },

    async forgotPassword( email: string , pass : string): Promise<ApiResponce<TUser | null> | ApiError> {
       
        const hashpass = await bcrypt.hash(pass, 10);

       
        const data = {
            filter : {email : email},
            update: {password : hashpass}
        }

        // console.log("data :",data);
        
        const userExist = await userRepo.updateUser(data);
        // console.log("userExist : ",userExist);
        // console.log("run update user data ");
        
        if (userExist.success == false) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        return new ApiResponce(userExist.statusCode, "Password Updated Successfuly" , null )

    } ,

    async resetTokenLimite( userId : mongoose.Types.ObjectId): Promise<ApiResponce<null> | ApiError> {
       
        const data = {
            filter : {_id : userId},
            update: {tokenUsed : 0}
        }
        
        const userExist = await userRepo.updateUser(data);
        // console.log("userExist : ",userExist);
        // console.log("run update user data ");
        
        if (userExist.success == false) {
            return new ApiError(userExist.statusCode, userExist.message)
        }
        return new ApiResponce(userExist.statusCode,  " Reset token limite successfuly " , null )

    } ,

    async SetTokenLimite( userId : mongoose.Types.ObjectId , tokenLimite : number): Promise<ApiResponce<null> | ApiError> {
       
        const data = {
            filter : {_id : userId},
            update: {tokenLimit : tokenLimite}
        }
        
        const userExist = await userRepo.updateUser(data);
        // console.log("userExist : ",userExist);
        // console.log("run update user data ");
        
        if (userExist.success == false) {
            return new ApiError(userExist.statusCode, userExist.message )
        }
        return new ApiResponce(userExist.statusCode, "Token Limited set successfuly " , null )

    } ,

    async SetSubscription( userId : mongoose.Types.ObjectId , isSubscribed : boolean): Promise<ApiResponce<null> | ApiError> {
       
        const data = {
            filter : {_id : userId},
            update: {isSubscribed : isSubscribed}
        }
        
        const userExist = await userRepo.updateUser(data);
        // console.log("userExist : ",userExist);
        // console.log("run update user data ");
        
        if (userExist.success == false) {
            return new ApiError(userExist.statusCode, userExist.message )
        }
        return new ApiResponce(userExist.statusCode, "Set Subscription State successfuly" , null )

    }




}


