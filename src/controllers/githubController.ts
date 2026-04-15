import type { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { randomUUID } from "node:crypto"
import { githubLoginService, githubService } from "../services/github.service.js"
import { ZodError } from "zod"
import { ApiError } from "../utils/ApiError.js"

export const githubRedirect = asyncHandler(async (req: Request, res: Response) => {

    console.log("githubRedirect call in controller !!");
        
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

    console.log("githubCallBack call in controller !!");
    

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
            console.log("getAllPublicRepos call in controller !!");
            
           const {userName} = req.params;
           const user = req.user;

        //    console.log("user name :",userName);
        //    console.log("call  :");

           const resp = await githubService.getAllPublicRepos(userName as string)
           if(resp.success == true){
               res.status(resp.statusCode).json({success : resp.success , message : resp.message , data: resp.data })
            } else {
                res.status(resp.statusCode).json({success : resp.success , message : resp.message , errors: resp instanceof ApiError ? resp.errors : ["Unknown error"] })
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





export const getRepoFiles = asyncHandler(async(req : Request , res : Response)=>{
    try {
             console.log("getRepoFiles call in controller !!");

           const {data} = req.body;
          
            const basetRepo = data.sha || "main"
            const deftaultType = data.type === "blob" ? "blobs" : "trees"

        //    console.log("full name :",full_name , "sha : ",basetRepo);

           const resp = await githubService.getFolderTree(data.full_name as string, basetRepo as string , deftaultType )
           console.log("all repo :",resp);
           
           if(resp.success == false && resp instanceof ApiError){
               res.status(resp.statusCode).json({success : resp.success , message : resp.message , errors: resp.errors })
               return
           }
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





export const getFileContents = asyncHandler(async(req : Request , res : Response)=>{
    try {
            console.log("getFileContents call in controller !!");
            
           const {data } = req.body;
          

           console.log("full name in file contents :",data.full_name);
           console.log("path in file contents :",data.path);

           const resp = await githubService.getFileContent(data.full_name as string, data.path as string )
        //    console.log("resp :",resp);
        if(resp.success == false && resp instanceof ApiError){
                res.status(resp.statusCode).json({success : resp.success , message : resp.message , errors: resp.errors })
        }else{

            res.status(resp.statusCode).json({success : resp.success , message : resp.message , data: resp.data })
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