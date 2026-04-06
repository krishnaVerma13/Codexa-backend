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

    }
}