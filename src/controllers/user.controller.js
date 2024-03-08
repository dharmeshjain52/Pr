import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/Apierror.js'
import { User } from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinaryfileupload.js'
import { ApiResponse } from '../utils/Apiresponse.js'

const userRegister = asyncHandler(async(req,res)=>{
   const {username,email,fullName,password}=req.body
   if ([username,email,fullName].some((field)=>field?.trim()==="")) {
    throw new ApiError(400,"All Fields are required")
   }
   //check existing user
   const userExists=await User.findOne({
    $or:[{ username },{ email }]
   })
   if(userExists){
    throw new ApiError(409,"username or email exists")
   }
   //avatar and coverimage validation and upload
   const avatarLocalPath=req.files?.avatar[0]?.path
   //validation
   let coverImageLocalPath
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0) {
       coverImageLocalPath=req.files.coverImage[0].path
   }
   
   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar Required")
   }
   //upload
   const avatarUpload=await uploadOnCloudinary(avatarLocalPath)
   const coverImageUpload=await uploadOnCloudinary(coverImageLocalPath)


   if(!avatarUpload){
      throw new ApiError(400,"Avatar Required")
   }
   //create user object
   const user = await User.create({
      username:username.toLowerCase(),
      fullName,
      email,
      password,
      avatar:avatarUpload.url,
      coverImage:coverImageUpload?.url || ""
   })
   const userCreated = User.findById(user._id).select("-password -refreshToken")
   if(!userCreated){
      throw new ApiError(500,"Something went wrong while registering the user")
   }
   //return response
   return res.status(201).json(
      new ApiResponse(200,userCreated,"User Regsitered Successfully") 
   )

})

export {userRegister}