import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import axios from "axios";
import { userRepo } from "../repository/user.repo.js";
import { JwtToken } from "../config/Jwt.js";
import { githubRepo } from "../repository/github.repo.js";

export const githubLoginService = async(code : string ) : Promise<ApiResponce<string> | ApiError>=>{
    // return new ApiError(400,"")                                                                                                                                                                                                                                                                                                                                                                                                                                                      

    const tokenRes = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        },
        {headers : {Accept : 'application/json  '}}
    )
    // console.log("token responce -tokenRes - :",tokenRes);
    
    const githubAccessToken =  tokenRes.data.access_token

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
 
  let user = await userRepo.findone({githubId : githubUser.id })
    // console.log("findone githubID-",githubUser.id," user :",user);

  if (user.success == false) {
    user = await userRepo.findone({ email :primaryEmail})
    // console.log("user in db",user);
    
    if (user.success == true) {
      // Case 2: email exists — link GitHub to existing account
      user = await userRepo.updateUser( { filter :{_id: user.data?._id}, update: {
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        githubAccessToken:githubAccessToken,
        authType: 'github',
      }})
    //   console.log("if state user :",user);
      
    } else {
      // Case 3: brand new user
      user = await userRepo.createUser({
        email: primaryEmail,
        name: githubUser.name || githubUser.login,
        role:"developer",
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        githubAccessToken:githubAccessToken,
        authType: 'github',
      })
    //   console.log("else state user :",user);

    }
  }

//   5. Issue your own JWT pair
  const token = await JwtToken.generateToken({userId : user.data?._id!})
    //   console.log("my token  :",token);


return new ApiResponce(200 , "User Github login sucessfully !! ", token)

}

export const githubServer = {

  async getAllPublicRepos(userName :string) : Promise<ApiResponce<any> | ApiError>{
    if(!userName){
      return new ApiError(400 , "userName query parameter is required")
    }
    const resp = await githubRepo.getAllPublicRepos(userName)
    
    console.log("github responce : ", resp);
    if(resp.success == true){
        return new ApiResponce(resp.statusCode , resp.message , resp.data)
    }
    return new ApiError(resp.statusCode , resp.message)
  }
}