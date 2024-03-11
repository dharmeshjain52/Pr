import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/Apierror.js'
import { User } from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinaryfileupload.js'
import { ApiResponse } from '../utils/Apiresponse.js'
import jwt from 'jsonwebtoken'
//generate access and refresh tokens
const generateRefreshAndAccessTokens=async(userId)=>{
   try {
   const user = await User.findById(userId)
   //call functions
   const refreshToken = user.generateRefreshToken()
   const accessToken = user.generateAccessToken()
   //saving refreshtoken to database
   user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false})
   //return
   return{refreshToken,accessToken}
   } catch (error) {
      throw new ApiError(500,"Something went Wrong while generating refresh and access Tokens")
   }

}

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

const userLogin=asyncHandler(async(req,res)=>{
   const{username,email,password}=req.body
   console.log(username,email)
   if(!username && !email) {
      throw new ApiError(400,"Username or Email is required")
   }
   //Searching user
   const enteredUser = await User.findOne({
      $or:[{username},{email}]
   })

   if(!enteredUser){
      throw new ApiError(404,"User not Found")
   }
   //validating password
   const isPasswordValid = await enteredUser.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401,"Password is not valid")
   }
   const{refreshToken,accessToken}=await generateRefreshAndAccessTokens(enteredUser._id)

   const loggedInUser=User.findById(enteredUser._id).select("-password -refreshToken")

   const options={
      httpOnly:true,
      secure:true
   }

   return res
   .status(200)
   .cookie("refreshToken",refreshToken,options)
   .cookie("accessToken",accessToken,options)
   .json(
      new ApiResponse(200,loggedInUser,"Logged In")
   )

})

const userLogOut = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken:undefined
         }
      },
      {
         new:true
      }
   )
   
   const options={
      httpOnly:true,
      secure:true
   }
   return res
   .status(200)
   .clearCookie("refreshToken",options)
   .clearCookie("accessToken",options) 
   .json(
      new ApiResponse(200,{},"User logged Out")
   )
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
   const inputrefreshToken=req.cookies.refreshToken || req.body.refreshToken

   if(!inputrefreshToken){
      throw new ApiError(400,"Couldn't fetch refresh token")
   }

   const decodedToken = jwt.verify(inputrefreshToken,process.env.REFRESH_TOKEN_SECRET)

   const user = await User.findById(decodedToken._id)

   if(!user){
      throw new ApiError(400,"Refresh Token Inavlid")
   }

   if(inputrefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh Token Inavlid or already used")
   }

   const {refreshToken,accessToken}=await generateRefreshAndAccessTokens(user._id)

   const options={
      httpOnly:true,
      secure:true
   }
   return res
   .status(200)
   .cookie("refreshToken",refreshToken,options)
   .cookie("accessToken",accessToken,options)
   .json(
      new ApiResponse(200,{},"New refresh and access token generated")
   )
})

const changePassword = asyncHandler(async(req,res)=>{
   const {oldPassword,newPassword} = req.body 
   //find user
   const user=User.findById(req.user?._id)
   if(!user){
      throw new ApiError(400,"Invalid user")
   }
   //check password
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
   if(!isPasswordCorrect){
      throw new ApiError(400,"Invalid old Password")
   }
   //set new Password
   user.password = newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(
      new ApiResponse(200,"Password Reset Successfully")
   )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json(200,req.user,"Current user")
})

const updateInfo = asyncHandler(async(req,res)=>{
   const {fullName,email}=req.body
   //validate
   if(!fullName && !email){
      throw new ApiError(400,"Enter Details")
   }
   //find and update
   const user=User.findByIdAndUpdate(req.user?._id,{
      $set:{
         fullName,
         email
      }
   },{new:true}).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200,user,"Details updated successfully")
   )
})

const updateAvatar=asyncHandler(async(req,res) => {
   const avatarLocalPath=req.user?.path
   //validate
   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is missing")
   }
   //upload on cloudinary
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   if(!avatar.url){
      throw new ApiError(400,"Error while uploading on cloudinary")
   }
   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            avatar:avatar.url
         }
      },{new:true}
   ).select("-password")
   return res
   .status(200)
   .json(
      new ApiResponse(200,"avatar updated successfully")
   )
})

const updateCoverImage=asyncHandler(async(req,res) => {
   const coverImageLocalPath=req.user?.path
   //validate
   if(!coverImageLocalPath){
      throw new ApiError(400,"cover image file is missing")
   }
   //upload on cloudinary
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   if(!coverImage.url){
      throw new ApiError(400,"Error while uploading on cloudinary")
   }
   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            coverImage : coverImage.url
         }
      },{new:true}
   ).select("-password")
   return res
   .status(200)
   .json(
      new ApiResponse(200,"cover image updated successfully")
   )
})

export {
   userRegister,
   userLogin,
   userLogOut,
   refreshAccessToken,
   changePassword,
   getCurrentUser,
   updateInfo,
   updateAvatar,
   updateCoverImage}