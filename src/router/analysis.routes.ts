import { Router } from "express";
import { AuthMiddleware } from "../middleware/authMiddleware.js";
import {
  analyzeFromEditor,
  analyzeFromGithub,
  getAnalysesByUser,
  getAnalysisById,
  getTimeline,
} from "../controllers/analysis.controller.js";

const AnalysisRouter = Router();


AnalysisRouter.post("/editor",AuthMiddleware, analyzeFromEditor);
AnalysisRouter.post("/github",AuthMiddleware, analyzeFromGithub);
AnalysisRouter.get("/history", AuthMiddleware, getAnalysesByUser);
AnalysisRouter.get("/timeline" , AuthMiddleware , getTimeline) // must pass Query /timeline?groupBy=
AnalysisRouter.get("/:id",AuthMiddleware, getAnalysisById);
export default AnalysisRouter;