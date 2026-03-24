import type { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { randomUUID } from "node:crypto"

export const githubRedirect = asyncHandler(async (req :Request, res: Response ) => {
    const state = crypto.randomUUID()

    res.cookie("oauth_state", state, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000 // 10 minutes
    })

    const params = new URLSearchParams({
       client_id : process.env.GITHUB_CLIENT_ID!,
       redirect_uri: process.env.GITHUB_CALLBACK_URL!,
       scope:"read:user user:email public_repo",
       state
    })
    // console.log(params);
    
    res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

export const githubCallBack = asyncHandler(async (req , res ) =>{
    const {code , state } = req.query

     if (state !== req.cookies.oauth_state) {
     res.status(400).json({ message: 'Invalid state parameter' })
  }
  res.clearCookie('oauth_state')
})
