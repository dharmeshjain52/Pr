import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteOnCloudinary,deleteVideoOnCloudinary} from "../utils/cloudinaryfileupload.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const owner = req.user._id
    // TODO: get video, upload to cloudinary, create video


    if(title?.trim() === ""){
        throw new ApiError(400,"Title is required")
    }

    const videoLocalPath = req.files?.videoFile[0].path
    let thumbnailLocalPath
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length >0){
        thumbnailLocalPath = req.files?.thumbnail[0].path
    }

    if(!videoLocalPath){
        throw new ApiError(400,"Video file is required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile){
        throw new ApiError(400,"Video file is required")
    }
    console.log(req.user._id)
    const video = await Video.create({
        title,
        description,
        videoFile:{
            public_id:videoFile.public_id,
            url:videoFile.url
        },
        thumbnail:{
            public_id:thumbnail.public_id,
            url:thumbnail.url
        },
        duration:videoFile?.duration,
        owner,
        isPublished:true
    })

    return res
    .status(200)
    .json(
        new ApiResponse(201,video,"video published")
    )
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400,"No video id found")
    }
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Invalid video Id")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video fetched")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body
    const thumbnailLocalPath = req.file?.path
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400,"No video id found")
    }

    if(!title && !description && !thumbnailLocalPath){
        throw new ApiError(400,"Enter details")
    }

    let thumbnailUrl
    if(thumbnailLocalPath){
    thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnailUrl){
        throw new ApiError(500,"thumbnail couldn't be found")
        }
    if(thumbnailUrl){
        const videoRetrieved = await Video.findById(videoId)
        await deleteOnCloudinary(videoRetrieved.thumbnail.public_id) 
    }

    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title,
                description,
                thumbnail:thumbnailUrl
            }
        },
        {
            new:true
        })
    if(!video){
        throw new ApiError(400,"Invalid video Id")
    }    

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Details updated")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400,"No video found")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError(400,"No video found")
    }
    const videoOnCloudinaryDelete = await deleteVideoOnCloudinary(deletedVideo.videoFile.public_id)
    const thumbnailOnCloudinaryDelete = await deleteOnCloudinary(deletedVideo.thumbnail.public_id)    
    // if(!videoOnCloudinaryDelete || !thumbnailOnCloudinaryDelete){
    //     throw new ApiError(500,"Couldn't find video or thumbnail on cloud")
    // }

    return res
    .status(200)
    .json(
        new ApiResponse(201,deletedVideo,"Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video does not exist")
    }
    
    // if(video._id != req.user._id){
    //     throw new ApiError(401,"Toggling is not allowed")
    // }

    video.isPublished = !video.isPublished
    await video.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(201,video.isPublished,"Toggled isPublished")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}