import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10,sortBy} = req.query

    if(!videoId){
        throw new ApiError(400,"Video id required")
    }

    const sort={}
    sort[sortBy] = -1
    const parseLimit = parseInt(limit)
    const pageSkip = (page-1)*parseLimit

    const comments = await Comment.aggregate([
        {
            $match:{
                video:new mongoose.mongo.ObjectId(videoId)
            }
        },
        {
            $sort:sort
        },
        {
            $skip:pageSkip
        },
        {
            $limit:parseLimit
        },
        {
            $project:{
                _id:1
            }
        }
    ])

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params
    const owner = req.user._id
    console.log(content)
    if(!content){
        throw new ApiError(400,"Please enter comment")
    }

    if(!videoId){
        throw new ApiError(400,"Channel id is not found")
    }

    const comment = await Comment.create(
        {
            content,
            video:videoId,
            owner
        }
    )

    if(!comment){
        throw new ApiError(500,"Could not comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,comment,"Commented successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const {commentId} = req.params
 
    if(!content){
        throw new ApiError(400,"Content not found")
    }

    const update = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {new:true}
    )

    if(!update){
        throw new ApiError("Couldn't find or update comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,update,"Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    
    if(!commentId){
        throw new ApiError(400,"cannot find comment id")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(400,"Could not find comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,deletedComment,"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }