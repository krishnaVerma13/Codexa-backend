import mongoose ,{Document , Schema}from "mongoose";
import type{ TUser } from "../Types.js";
import e from "express";


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
        required: true,
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
    trialUsed: {
        type: Number,
        default: 0
    },
    trialLimit: {
        type: Number,
        default: 10
    },
    authType:{
        type: String,
        enum: ["email" , "github"]
    },
    emailOTP:{
        type: Number,
    }
   } , { timestamps: true });

export default mongoose.model<TUser>("User", UserModal);