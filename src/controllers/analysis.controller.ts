import type { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { analysisService } from "../services/analysis.service.js";
import {
    analyzeFromEditorSchema,
    analyzeFromGithubSchema,
    analysisHistorySchema,
    timelineQuerySchema,
} from "../validations/analysis.schema.js";
import { Types, type ObjectId } from "mongoose";
import mongoose from "mongoose";
import { success } from "zod";
import { timelineService } from "../services/timeline.service.js";



// Utility: extract userId from JWT-attached req.user
const getObjectId = (stringId: string): Types.ObjectId | ApiError => {
    if (mongoose.Types.ObjectId.isValid(stringId)) {
        const objectId = new mongoose.Types.ObjectId(stringId);
        return objectId
    } else {
        return new ApiError(400, "Invalid userID")
    }
};

// POST /api/analysis/editor
export const analyzeFromEditor = asyncHandler(async (req: Request, res: Response) => {
        console.log("run analyzeFromEditor");

    const userId = getObjectId(req.user ? req.user?.userId : "");
    if (userId instanceof ApiError) {
        res.status(400).json({ success: false, message: "Invalid UserId" });
        return
    }

    const body = analyzeFromEditorSchema.parse(req.body);
    // console.log("call analyze from Editor body :",req.body);
    
    const analysis = await analysisService.analyzeFromEditor(userId, { ...body, fileName: body.fileName ?? undefined });

    if (analysis instanceof ApiError) {
        res.status(analysis.statusCode).json({success: false , message : analysis.message , error : analysis.errors})
    }

    res.status(201).json({ success: true, message: "Code analyzed successfully.", data: analysis });
    return
});





// POST /api/analysis/github
export const analyzeFromGithub = asyncHandler(async (req: Request, res: Response) => {
    console.log("call analyzeFromGithub");

    const userId = getObjectId(req.user ? req.user?.userId : "");
    if (userId instanceof ApiError) {
        res.status(400).json({ success: false, message: "Invalid UserId" });
        return
    }
    const body = analyzeFromGithubSchema.parse(req.body);

    const analysis = await analysisService.analyzeFromGithub(userId, body);

    res.status(201).json({ success: true, message: "GitHub file analyzed successfully.", data: analysis });
});



// GET /api/analysis/history
export const getAnalysesByUser = asyncHandler(async (req: Request, res: Response) => {
        console.log("run getAnalysesByUser ");

    const userId = getObjectId(req.user ? req.user?.userId : "");
    
    if (userId instanceof ApiError) {
        res.status(400).json({ success: false, message: "Invalid UserId" });
        return
    }

    const query = analysisHistorySchema.parse(req.query);

    const page = parseInt(query.page ?? "1", 10);
    const limit = parseInt(query.limit ?? "10", 10);

    const result = await analysisService.getAnalysesByUser(userId, page, limit);

    res.status(200).json(
        { success: true, message: "Analysis history fetched.", data: { ...result, page, limit } }
    );
});



// GET /api/analysis/:id
export const getAnalysisById = asyncHandler(async (req: Request, res: Response) => {
        console.log("run getAnalysisById ");

    const userId = getObjectId(req.user ? req.user?.userId : "");
    if (userId instanceof ApiError) {
        res.status(400).json({ success: false, message: "Invalid UserId" });
        return
    }
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        res.status(400).json({ success: false, message: "Id not found " })
        return
    }
    const analysis = await analysisService.getAnalysisById(id, userId);

    res.status(200).json({ success: true, message: "Analysis fetched.", data: analysis });

})


// GET /api/analysis/timeline
export const getTimeline = asyncHandler(async (req: Request, res: Response) => {
    console.log("run getTimeline");
    
 const userId = getObjectId(req.user ? req.user?.userId : "");
    if (userId instanceof ApiError) {
        res.status(400).json({ success: false, message: "Invalid UserId" });
        return
    }
  const { groupBy } = timelineQuerySchema.parse(req.query);

  const timeline = await timelineService.getTimeline(userId, groupBy);

  if(timeline instanceof ApiError){
      res.status(timeline.statusCode).json({success : false, message : "Timeline fetched fail."  });
    }


  res.status(200).json({success : true, message : "Timeline fetched." , data : timeline });
});