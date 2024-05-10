import dotenv from 'dotenv';
dotenv.config()
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js"
import  jwt  from 'jsonwebtoken';
import User from '../models/user.model.js';

// authorization ka format ese hota h 
// Authorization = BearerToken
// isliye hum authorization ki value leke usme se bearer hata denge to hamare pass sirf token reh jayega


// yaha res ka use nahi ho raha to hum uski jagah" _" use kar sakte h
export const VerifyJWT=asyncHandler( async(req, _,next)=>{
    try { 
        
        
// yaha hum pehle cookie se token le rahe h user ka or agar phone se aa raha hoga to wo custom header ma aata h
       const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
     
       if(!token){
        throw new ApiError(401,"Unauthorized Request")
       }
      
       // ab jwt se decode karvayenge token

       const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     

       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

       if (!user){
        throw new ApiError(401,"invalid access token")
       }
     

       req.jwtuser = user
       next()

    } catch (error) {
        throw new ApiError("400",error?.message || "invalid access token")
    }
})