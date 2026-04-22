import type { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import { ApiError } from "../utils/ApiError.js";
import { patternsService } from "../services/patterns.service.js";
import mongoose from "mongoose";
import { Types, type ObjectId } from "mongoose";



const getObjectId = (stringId: string): Types.ObjectId | ApiError => {
    if (mongoose.Types.ObjectId.isValid(stringId)) {
        const objectId = new mongoose.Types.ObjectId(stringId);
        return objectId
    } else {
        return new ApiError(400, "Invalid userID")
    }
};

// GET /api/patterns/myPattern
export const getMyPatterns = asyncHandler(async (req: Request, res: Response) => {
  const userId = getObjectId(req.user ? req.user?.userId : "");
     if (userId instanceof ApiError) {
         res.status(400).json({ success: false, message: "Invalid UserId" });
         return
     }

  const patterns = await patternsService.getMyPatterns(userId);

  if (!patterns) {
     res.status(200).json({ success : false, message : "No patterns yet. Run at least 3 analyses first." });
  }else{
      res.status(200).json({success : true, message : "Patterns fetched." ,data: patterns});
    }


});

export const analysisMyPatterns = asyncHandler(async (req: Request, res: Response) => {
  const userId = getObjectId(req.user ? req.user?.userId : "");
     if (userId instanceof ApiError) {
         res.status(400).json({ success: false, message: "Invalid UserId" });
         return
     }

  const patterns = await patternsService.runPatternDetection(userId);

  if (!patterns) {
     res.status(200).json({ success : false, message : "No patterns yet. Run at least 3 analyses first." });
  }else{
      res.status(200).json({success : true, message : "Patterns fetched." ,data: patterns});
    }


});