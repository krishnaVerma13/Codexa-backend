import { log } from "node:console";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";

import axios from "axios";

const GITHUB_API = "https://api.github.com";

export const githubRepo = {

    async getAllPublicRepos(userName : string) : Promise<ApiResponce<any> | ApiError> {
        try {
            const url = `${GITHUB_API}/users/${userName}/repos`
            const response = await axios.get(url)
            return new ApiResponce(200, "Public repositories fetched successfully", response.data)
        } catch (error) {
            return new ApiError(500, "Failed to fetch public repositories", [error instanceof Error ? error.message : "Unknown error"])
        }

    },

    async getPublicRepo(full_name : string) : Promise<ApiResponce<any> | ApiError> {
        try {
            const url = `${GITHUB_API}/repos/${full_name}/contents`
            const response = await axios.get(url)
            return new ApiResponce(200, "Public repositories fetched successfully", response.data)
        } catch (error) {
            return new ApiError(500, "Failed to fetch public repositories", [error instanceof Error ? error.message : "Unknown error"])
        }
    },

    async getFolderTree (full_name : string , sha : string , type : string) : Promise<ApiResponce<any> | ApiError>{
        try {
            const url = `${GITHUB_API}/repos/${full_name}/git/${type}/${sha}`
            log("url : ", url);
            const response = await axios.get(url)
            return new ApiResponce(200, "Public repositories fetched successfully", response.data)
        } catch (error) {
            return new ApiError(500, "Failed to fetch public repositories", [error instanceof Error ? error.message : "Unknown error"])
        }
    }



}