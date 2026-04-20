import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import axios from "axios";
import { userRepo } from "../repository/user.repo.js";
import { JwtToken } from "../config/Jwt.js";
import { githubRepo } from "../repository/github.repo.js";
import type { GithubRepoResponce } from "../Types.js";

export const githubLoginService = async (code: string): Promise<ApiResponce<string> | ApiError> => {
  // return new ApiError(400,"")                                                                                                                                                                                                                                                                                                                                                                                                                                                      
  // console.log("github login call !!");

  const tokenRes = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    },
    { headers: { Accept: 'application/json  ' } }
  )
  // console.log("token responce -tokenRes - :", tokenRes);

  const githubAccessToken = tokenRes.data.access_token

  // console.log("githubAccessToken : ",githubAccessToken);


  if (!githubAccessToken) {
    return new ApiError(400, 'GitHub token exchange failed — invalid or expired code')
  }

  // 2. Fetch GitHub profile
  const { data: githubUser } = await axios.get(
    'https://api.github.com/user',
    {
      headers: { Authorization: `Bearer ${githubAccessToken}` },
    })
  // console.log("user github data : ",githubUser);


  // 3. Fetch verified email separately
  const { data: emails } = await axios.get(
    'https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${githubAccessToken}` },
  })
  //   console.log("github user email :",emails);


  const primaryEmail = emails.find(
    (e: any) => e.primary === true && e.verified === true
  )?.email

  if (!primaryEmail) {
    return new ApiError(400, 'No verified primary email found on this GitHub account')
  }

  // 4. Upsert user in MongoDB (3 cases)

  let user = await userRepo.findone({ githubId: githubUser.id })
  // console.log("findone githubID-",githubUser.id," user :",user);

  if (user.success == false) {
    user = await userRepo.findone({ email: primaryEmail })
    // console.log("user in db",user);

    if (user.success == true) {
      // Case 2: email exists — link GitHub to existing account
      user = await userRepo.updateUser({
        filter: { _id: user.data?._id }, update: {
          githubId: String(githubUser.id),
          githubUsername: githubUser.login,
          githubAccessToken: githubAccessToken,
          authType: 'github',
        }
      })
      // console.log("github token :", githubAccessToken);
      //   5. Issue your own JWT pair
      const token = await JwtToken.generateToken({ userId: user.data?._id! })
      // console.log("existing user new token  :", token);
      return new ApiResponce(200, "User Github login sucessfully !! ", token)

    } else {
      // Case 3: brand new user
      user = await userRepo.createUser({
        email: primaryEmail,
        name: githubUser.name || githubUser.login,
        role: "developer",
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        githubAccessToken: githubAccessToken,
        authType: 'github',
      })

      //   5. Issue your own JWT pair
      const token = await JwtToken.generateToken({ userId: user.data?._id! })
      // console.log("existing user new token  :", token);
      return new ApiResponce(200, "New User Github login sucessfully !! ", token)

      //   console.log("else state user :",user);

    }
  }

  // Case 1: GitHub ID already linked — update Github access token and proceed
  if (user.success == true) {
    await userRepo.updateUser({
      filter: { _id: user.data?._id }, update: {
        githubAccessToken: githubAccessToken
      }
    })

    //   5. Issue your own JWT pair
    const token = await JwtToken.generateToken({ userId: user.data?._id! })
    // console.log("existing user new token  :", token);
    return new ApiResponce(200, "Github login sucessfully and new token  !! ", token)

  }

  return new ApiError(400, 'Somthing wents wrong user not login process not done properly')
}




export const githubService = {

  async getAllPublicRepos(userName: string): Promise<ApiResponce<GithubRepoResponce> | ApiError> {
    if (!userName) {
      return new ApiError(400, "userName query parameter is required")
    }
    const resp = await githubRepo.getAllPublicRepos(userName)

    // console.log("github responce : ", resp);
    if (resp.success == true) {

      const reposData = resp.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        language: repo.language,
        created_at: repo.created_at,
        updated_at: repo.updated_at
      }));
      // console.log("repodata :", reposData);

      return new ApiResponce(resp.statusCode, resp.message, reposData)
    }
    return new ApiError(resp.statusCode, resp.message)
  },




  async getFolderTree(full_name: string, sha: string, type: string): Promise<ApiResponce<any> | ApiError> {
    if (!full_name) {
      return new ApiError(400, "full_name query parameter is required")
    }
    const resp = await githubRepo.getFolderTree(full_name, sha, type)

    // console.log("repo content : ", resp);
    if (resp.success == true) {
      return new ApiResponce(resp.statusCode, resp.message, resp.data)
    }
    return new ApiError(resp.statusCode, resp.message)
  },




  async getFileContent(full_name: string, path: string): Promise<ApiResponce<any> | ApiError> {
    if (!full_name) {
      return new ApiError(400, "full_name  parameters are required")
    }
    const resp = await githubRepo.getFileContent(full_name, path)

    // console.log("repo content : ", resp);
    if (resp instanceof ApiError) {
      return new ApiError(resp.statusCode, resp.message, resp.errors)
    }
    return new ApiResponce(resp.statusCode, resp.message, resp.data)
  }




}