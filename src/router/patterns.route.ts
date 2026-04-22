import { Router } from "express";

import { analysisMyPatterns, getMyPatterns } from "../controllers/patterns.controller.js";
import { AuthMiddleware } from "../middleware/authMiddleware.js";

const PatternRouter = Router();


PatternRouter.get("/myPattren", AuthMiddleware ,getMyPatterns);
PatternRouter.get("/analysisPattren", AuthMiddleware , analysisMyPatterns);

export default PatternRouter;