import User from "../modules/UserModal.js";
import type { TUser, UpdateUserSchema } from "../Types.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";




export const userRepo = {
   
    async findById(id : string):Promise< ApiResponce<TUser> | ApiError> { 
        const userData = await User.findById(id);
        if(!userData){
            return new ApiError(400 , " User not found , Invalid credentials" )
        }
        return new ApiResponce(200 , "User found" , userData) 
    } ,
    
    // findone take an object which have {key : value} 
    async findone( serchOb : object):Promise< ApiResponce<TUser | null> | ApiError> { 
        const userData = await User.findOne(serchOb);
        if(!userData){
            return new ApiError(400 , " User not found , Invalid credentials" )
        }
        return new ApiResponce(200 , `User found` , userData) 
    } ,

    async createUser(data : object): Promise<ApiResponce<TUser> | ApiError>{
        console.log("createUSer call")
        const userData = await User.create(data);
        if(userData._id){
            return new ApiResponce(200 , "User Created" , userData) 
        }
        return new ApiError(500 , "DB error , user not Created" )
    },
    
   
    async updateUser(data : UpdateUserSchema): Promise<ApiResponce<TUser> | ApiError>{
        console.log("updateuser call")
        const userData = await User.findOneAndUpdate(data.filter , data.update , {new : true});
        if(userData){
            return new ApiResponce(200 , "User Updated" , userData) 
        }
        return new ApiError(500 , "DB error , user not Updated" )
    }



}