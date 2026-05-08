import mongoose ,{Document , Schema}from "mongoose";
import type{ TUser } from "../Types.js";
import e from "express";
import { boolean } from "zod";


const UserModal = new Schema<TUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        sparse: true,
    },
    role: {
        type: String,
        enum : ["developer" , "admin"],
        required: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true,
    },
    githubUsername: {
        type: String,
        unique: true,   
        sparse: true,
    },
    githubAccessToken: {
        type: String,
        sparse: true,
    },
    isSubscribed: {
        type: Boolean,
        default: false
    },
    tokenUsed: {
        type: Number,
        default: 0
    },
    tokenLimit: {
        type: Number,
        default: 10000
    },
    authType:{
        type: String,
        enum: ["email" , "github"]
    },
    userProfile:{
        type: String,
        default : ""
    },
    isLimitRichied:{
        type: Boolean,
        default : false
    },
    resetLimiteAt:{
        type: Date,
        default : ""
    },
    emailOTP:{
        type: Number,
    }
   } , { timestamps: true });

export default mongoose.model<TUser>("User", UserModal);