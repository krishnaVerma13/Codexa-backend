import nodemailer from 'nodemailer'
import { EmailTemplate } from '../utils/EmailTemplate.js';
import { userRepo } from '../repository/user.repo.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponce } from '../utils/ApiResponce.js';



interface EmailVerifactoin {
    username: string;
    email: string;
}

function rendomNumber() {
    return Math.floor(Math.random() * 100000) + 99999
}


export const SendEmailVerifaction = async (data: EmailVerifactoin): Promise<ApiError | ApiResponce<null>> => {
    
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })

    const verifyCode = rendomNumber()
    // console.log("code pin :", verifyCode);
    // console.log("Email env :", process.env.EMAIL_HOST);
    // console.log("pass env  :", process.env.EMAIL_PASSWORD ? "loaded" : "not loaded");

    const updatedata = {
        filter: { email: data.email },
        update: { emailOTP: verifyCode }
    }

    const otpSave = await userRepo.updateUser(updatedata);
    console.log("opt responce :", otpSave);
    if(otpSave.success == false){
        return new ApiError(otpSave.statusCode , otpSave.message)
    }

    const emailResp = await transporter.sendMail({
        from: `"Codexa" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: `${verifyCode} is your Codexa verification code`,
        html: EmailTemplate(verifyCode, data.username),
    });

    return new ApiResponce(200 , "Verification code sent to email" , null)
    // console.log("email responce :", emailResp);
}





