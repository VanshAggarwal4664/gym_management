import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { ValidEmail } from "../utils/ValidEmail.js";
import User from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { VerifyJWT } from "../middlewares/auth.middleware.js";
import jwt from 'jsonwebtoken';

const genrateRefreshandAccessToken=  async (userId)=>{
  // iska naam tuser isliye diya h kyukki yeh user token genrate karne wale process ke liye bulaaya h taaki aage kisi se confusion na ho
  try {
    User.findById()
    const tuser=await User.findById(userId);
    const refreshToken = tuser.genrateRefreshToken();
    const accessToken = tuser.genrateAccessToken();
    tuser.refreshToken=refreshToken;
    await tuser.save({ validateBeforeSave: false })
    return {refreshToken, accessToken,tuser}

  } catch (error) {
    throw new ApiError(500, "error occured while generating tokens ")
  }
 
}
   




const registerUser = asyncHandler( async(req , res) =>{
  //get user details from frontend kyuki yeh easy h kyuki data json format ma aata h
        const {email,username ,password}=req.body;

  //images ka data manage karenge humne multer use kiya h to wo kuch or method add kar deta h "req" ma
          
     const logoLocalPath = req.files?.logo[0]?.path  // multer ne hamare server pe upload kar diya h or uska path send kar raha h

     if(!logoLocalPath){
        throw new ApiError(400, " logo file is required - multer error")
     }

  // validation - hum yaha check karenge field empty or email ka format sahi h ya nahi

//   The some() method returns true (and stops) if the function returns true for one of the array elements.

// The some() method returns false if the function returns false for all of the array elements.

// The trim() method removes whitespace from both sides of a string.

// The trim() method does not change the original string.


   if([email,username,password].some((field)=>{
     return field?.trim()===""
   })){
    throw new ApiError(400,"All Fields are compulsary")
   }
    if(!ValidEmail(email)){
       throw new ApiError(400, "Email Format is Incorrect")
    }
    

  //   check if user already exist
   const ExistedUser= await User.findOne({
        $or:[{ username },{ email }]
    })
  
    if(ExistedUser){
        throw new ApiError(409, "username or email already exist")
    }


  //upload them on cloudinary and check that logo is on cloudinary or not
  const logo = await uploadonCloudinary(logoLocalPath) // cloudinary hume response de raha h return ma

  if(!logo){
    throw new ApiError(400, " logo file is required-cloudinary error")
 }

  //create user object -create entry in db
   const user= await User.create({
        username,
        email,
        password,
        logo:logo.url
    })

  //remove password and refresh token field from response 
  //await User.findById(user._id) is se hum check kar rahe h ki wo database ma h ya nahi
  //.select("-password -refreshToken") is se response aayega jisme password or refreshtoken nahi hoga
  const createdUser=await User.findById(user._id).select("-password -refreshToken")
 
   //check for user creation
  if(!createdUser){
    throw new ApiError(500, "something went wrong while registering the user")
  }

  //return response
 res.status(201).json(
    new ApiResponse(200,createdUser,"User Registered Successfully")
 )

})

const loginUser = asyncHandler( async(req,res)=>{
  //login form se data le rahe h 
  const {username,password} = req.body
  // ab check kar rahe h khali to nahi 
  if(!username){
    throw new ApiError(400,"username is required")
  }

  //check karege database ma
  // yaha jo user call kiya h humne database se usme refreshtoken khali h kyuki refresh token ki value baad ma add hui h
  const user = await User.findOne({username})
  if(!user){
    throw new ApiError(404, " User not Found")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(400, "Password is incorrect")
  }

  const {accessToken,refreshToken} = await genrateRefreshandAccessToken(user._id);

 //yeh hum isliye kar rahe kyuki hume refresh token wali value chahiye jo baad ma add hui h
 //do tareeko se kar sakte h first database call karlo wapis

 const LoggedInUser=await User.findById(user._id).select("-password -refreshToken")

 // ya pehle wale user ko update karlo ot tuser ko le aao
  //  const updateduser={
  //   ...user.toObject(), refreshToken:tuser.refreshToken
  //  }
  //  const loggedInUser=updateduser.select()


// cookie ke liye kar rahe h hum options
//cookie front end se bhi modify kar sakte h but humne yeh option de diya to ab server side se hi update hogi
  const options={
    httpOnly : true,
    secure : true
   }
  //  cookie("accessToken",accessToken,options) first is key second is value and last is option which we define earlier 
   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(200,{user:LoggedInUser, accessToken,refreshToken},"User Logged In successfully")
   )

})

// user ko logout karne ke liye hume user chahiye hoga ki kisko logout karna h kyuki logout ke liye konsa hum form bharvate h
// iske liye hum apna middleware likh rahe h jo hume user dega 
const logoutUser=asyncHandler(async (req,res)=>{

     await User.findByIdAndUpdate(req.jwtuser._id,
      {
        $set: 
        {
          refreshToken:undefined

        },
        
      },
      {
        new:true
        //{ new: true } This option specifies that the updated document should be returned after the update operation is completed.
        // If new is set to true, the updated document will be returned. If new is set to false or omitted, the original document before the update will be returned.
      }
    )

  

    const options = {
      httpOnly : true,
      secure : true
     }

      return res.status(200)
     .clearCookie("refreshToken",options)
     .clearCookie("accessToken",options).json(new ApiResponse(200,{},"User Logged Out"))
})

const newAcessToken = asyncHandler(async (req,res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

   if(!incomingRefreshToken){
    throw new ApiError(401," Unauthorized Request")
   }
  try {
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
     const user= await User.findById(decodedToken?._id)
     if(!user){
      throw new ApiError(401,"invalid refresh token")
     }
  
     if(incomingRefreshToken!==user.refreshToken){
      throw new ApiError(401,"refresh token is expired or used")
     }
  
     const {newAccessToken,newRefreshToken} = await genrateRefreshandAccessToken(user._id)
     const options={
      httpOnly : true,
      secure : true
     }
    //  cookie("accessToken",accessToken,options) first is key second is value and last is option which we define earlier 
     return res.status(200)
     .cookie("accessToken",newAccessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
      new ApiResponse(200,{user:user, accessToken: newAccessToken,refreshToken:newRefreshToken},"Token Regenrated successfully")
     )
  } catch (error) {
    throw new ApiError(401 , error?.message||"invalid Token")
  }
   

})


const changeCurrentPassword = asyncHandler(async(req,res)=>{

    // password data lena padega hume
    const{oldPassword,Newpassword,confirmPassword}=req.body;

    // yaha check karengen ki koi field khali to nahi

    if([oldPassword || Newpassword || confirmPassword].some((field)=>{
      return field?.trim()===""
    })){
       throw new ApiError(400,"All fields are required")
    }
   // yaha check karenge ki new password or confirm password equal h ya nahi
    if(!(Newpassword===confirmPassword)){
        throw new ApiError(400,"new and confirm password should be equal");
    }

    // ab hum check karenge ki jo oldpassword aaya h wo database se match h ya nahi or is se pehle
    // hum middleware call karvayenge verifyjwt wala is controller se pehle routes ma jis se verify ho jayega ki request sahi jagah se aa rahi h
    //or middleware ek kaam yeh bhi karta h wo req.jwtuser ma user daal deta h to hum usi user ko use karenge

    const user = await User.findById(req.jwtuser?._id)
    // ab hum check karenge ki user ka password sahi h ya nahi wo bycrypt check karta h uske liye  
   const isPasswordValid = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordValid){
    throw new ApiError(400,"old Password is correct or wrong credentials")
   }

   // agar password sahi h then usko save karva do

   user.password=Newpassword;
   await user.save({validateBeforeSave:false});

   return res.status(200).json(new ApiResponse(200,{},"Password Updated Successfully"));

})

const getCurrentUser= asyncHandler(async(req,res)=>{
  return res.status(200).json(new ApiResponse(200,req.jwtuser,"current user fetched successfully"))
})

const updateUserDetails= asyncHandler(async(req,res)=>{
     // pehle hume data lena hoga
     const{username ,email} = req.body;

     // ab check karna h khali to nahi fields  

     if(!username || !email){
      throw new ApiError(400,"all fields are required");
     }
     // email ka format check karenge

     if(!ValidEmail(email)){
      throw new ApiError(400, "Email Format is Incorrect")
   }
 
   // hum middleware call karvayenge verifyjwt wala isss controller se pehle routes wali file ma jis se verify ho jayega ki request sahi jagah se aa rahi h
    //or middleware ek kaam yeh bhi karta h wo req.jwtuser ma user ki value daal deta h to hum usi user ko use karenge

   const user= await User.findByIdAndUpdate(
    req.jwtuser?._id,
    {
      $set:{username, email}
    },
    {
      new:true
    }
  ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"email and username updated successfully"))

})

const updateUserLogo= asyncHandler(async(req,res)=>{

 //images ka data manage karenge humne multer use kiya h to wo kuch or method add kar deta h "req" ma
          
 const logoLocalPath = req.files?.logo[0]?.path  // multer ne hamare server pe upload kar diya h or uska path send kar raha h

 if(!logoLocalPath){
    throw new ApiError(400, " logo file is required")
 }

  const Logo= await uploadonCloudinary(logoLocalPath);

  if(!Logo.url){
    throw new ApiError(400,"erro while uploading on cloudinary")
  }

    // hum middleware call karvayenge verifyjwt wala isss controller se pehle routes wali file ma jis se verify ho jayega ki request sahi jagah se aa rahi h
    //or middleware ek kaam yeh bhi karta h wo req.jwtuser ma user ki value daal deta h to hum usi user ko use karenge

 const user= await User.findByIdAndUpdate(
    req.jwtuser?._id,
    {
       $set:{logo:Logo.url}
    },
    {
      new:true
    }
  ).select("-password")


  return res.status(200).json(new ApiResponse(200,user,"Logo Image Updated Successfully"))
})


export {registerUser ,loginUser,logoutUser,newAcessToken,changeCurrentPassword,getCurrentUser,updateUserDetails,updateUserLogo};
