import { Router } from "express";
import {
  getMyRecommendations,
  refreshRecommendations,
} from "../controllers/recommendations.controller.js";
import { AuthMiddleware } from "../middleware/authMiddleware.js";

const RErouter = Router();


RErouter.get("/me",   AuthMiddleware, getMyRecommendations);
RErouter.post("/refresh", AuthMiddleware, refreshRecommendations);

export default RErouter;