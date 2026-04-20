import "dotenv/config";
// dotenv.config();
// console.log("ENV LOAD :", process.env.SECRET_KEY);
import cookieParser from "cookie-parser";
import express from "express";
import type { Request, Response } from "express";
import UserRouter from "./router/routers.js";
import connectDB from "./config/dbConnection.js"
import cors from "cors" 
import AnalysisRouter from "./router/analysis.routes.js";

connectDB()
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cookieParser())
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }))

app.get("/", (req : Request, res : Response) => {
  res.send("Codexa Backend Running 🚀");
});

app.use("/api/user" , UserRouter );
app.use("/api/analysis" , AnalysisRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 