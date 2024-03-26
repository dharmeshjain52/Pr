import mongoose from "mongoose"
import { User } from "../models/user.models.js" 
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscriptions.models.js"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const owner = req.user._id

    const dashBoard = await User.aggregate([
        {
            $match:{
                _id:owner
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscription",
                as:"subscriberTo"
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"videos"
            }
        },
        // {
        //     $unwind:"$videos"
        // },
        // {
        //     $group:{
        //         _id:"$_id",
        //         videos:{
        //             $sum:1
        //         } ,
        //         totalviews:{
        //             $sum:"$videos.views"
        //         },   


        //   }
        // },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"likedBy",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"owner",
                as:"comments"
            }
        },
        {
            $addFields:{
                totalSubscribers:{
                    $size:"$subscribers"
                },
                totalSubscribedTo:{
                    $size:"$subscriberTo"
                },
                totalVideos:{
                    $size:"$videos"
                },
                totalLikes:{
                    $size:"$likes"
                },
                totalComments:{
                    $size:"$comments"
                }
            }
        },
        {
            $project:{
                username:1,
                avatar:1,
                totalSubscribers:1,
                totalSubscribedTo:1,
                totalVideos:1,
                totalLikes:1,
                totalComments:1,
                totalviews:1
            }
        }
    ])

    if(!dashBoard.length>0){
        throw new ApiError(400,"Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,dashBoard,"Dashboard")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const owner = req.user._id

    const videos = await Video.aggregate([
        {
            $match:{
                owner
            }
        },
        {
            $project:{
                _id:1
            }
        }
    ])

    if(!videos){
        throw new ApiError(400,"Could not find videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,videos,"Videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }