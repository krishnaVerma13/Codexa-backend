import type { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { randomUUID } from "node:crypto"
import { githubLoginService, githubServer } from "../services/github.service.js"
import { ZodError } from "zod"

export const githubRedirect = asyncHandler(async (req: Request, res: Response) => {
    const state = crypto.randomUUID()

    res.cookie("oauth_state", state, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000 // 10 minutes
    })

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: process.env.GITHUB_CALLBACK_URL!,
        scope: "read:user user:email public_repo",
        state
    })
    // console.log(params);

    res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

export const githubCallBack = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query

    // console.log("github callback req :",req.cookies);
    // console.log("cookies in callback :",req.cookies.oauth_state);
    // console.log("callback controller code :",code," state :",state);


    if (state !== req.cookies.oauth_state) {
        res.status(400).json({ message: 'Invalid state parameter' })
    }
    res.clearCookie('oauth_state')

    const resp = await githubLoginService(code as string)
    if (resp.success == true) {
        res.redirect(`${process.env.FRONTEND_CALLBACK}/auth/callback?token=${resp.data}`)
    }
})

export const getAllPublicRepos = asyncHandler(async(req : Request , res : Response)=>{
    try {
           const {userName} = req.params;

           console.log("user name :",userName);

           const resp = await githubServer.getAllPublicRepos(userName as string)
           
            res.status(resp.statusCode).json({success : resp.success , message : resp.message , data: resp.data })
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