import { log } from "node:console";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";

import axios from "axios";

const GITHUB_API = "https://api.github.com";

export const githubRepo = {

    async getAllPublicRepos(userName: string): Promise<ApiResponce<any> | ApiError> {
        try {
            const url = `${GITHUB_API}/users/${userName}/repos`
            const response = await axios.get(url)
            return new ApiResponce(200, "Public repositories fetched successfully", response.data)
        } catch (error) {
            return new ApiError(500, "Failed to fetch public repositories", [error instanceof Error ? error.message : "Unknown error"])
        }

    },



    async getFolderTree(full_name: string, sha: string, type: string): Promise<ApiResponce<any> | ApiError> {
        try {
            const url = `${GITHUB_API}/repos/${full_name}/git/${type}/${sha}`
            log("url : ", url);
            const response = await axios.get(url)
            return new ApiResponce(200, "Public repositories fetched successfully", response.data)
        } catch (error) {
            // console.log("error :",error);   
            
            if (axios.isAxiosError(error)) {
                return new ApiError(error?.response?.status || 500, error?.response?.data?.message || "Failed to fetch public repositories", [error instanceof Error ? error.message : "Unknown error"])
            }
            return new ApiError(500, "Failed to fetch public repositories", [error instanceof Error ? error.message : "Unknown error"])
        }
    },


    async getFileContent(full_name: string, path: string): Promise<ApiResponce<any> | ApiError> {
        try {
            const url = `${GITHUB_API}/repos/${full_name}/contents/${path ? path : ""}`
            log("url : ", url);
            // console.log("file content responce : ");
            const response = await axios.get(url)

            
            //   if(response.status === 200){
            return new ApiResponce(200, "Public repositories fetched successfully", response.data)
            // }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const githubMessage = err.response?.data?.message;

                switch (status) {
                    case 400:
                        return new ApiError(400, "Bad request", [githubMessage || "Invalid request"]);

                    case 401:
                        return new ApiError(401, "Unauthorized", ["Invalid or missing GitHub token"]);

                    case 403:
                        return new ApiError(403, "Forbidden", [
                            githubMessage === "rate limit exceeded"
                                ? "GitHub API rate limit exceeded. Try again later."
                                : "Access denied to this resource"
                        ]);

                    case 404:
                        return new ApiError(404, "Not found data", [
                            `File not found`
                        ]);

                    case 422:
                        return new ApiError(422, "Unprocessable entity", [githubMessage || "Invalid ref or path"]);

                    case 500:
                        return new ApiError(500, "GitHub server error", ["GitHub is having issues, try again later"]);

                    default:
                        return new ApiError(status || 500, "GitHub API error", [
                            githubMessage || "Unknown GitHub error"
                        ]);
                }
            }

            // Non-Axios errors (network issues, etc.)
            return new ApiError(500, "Internal server error", [
                err instanceof Error ? err.message : "Unknown error"
            ]);

        }
    }





}