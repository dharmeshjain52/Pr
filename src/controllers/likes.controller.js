import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const likedBy = req.user._id
    if(!videoId){
        throw new ApiError(400,"Could not find video id")
    }
    
    const liked = await Like.findOne({video:videoId})

    if(!liked){
    const like = await Like.create(
        {
            video:videoId,
            likedBy
        }
    )
    if(!like){
        throw new ApiError(500,"Could not like the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,like,"Liked the video")
    )
   } 
   else{
        const deleteLike = await Like.findByIdAndDelete(liked._id)

        if(!deleteLike){
            throw new ApiError(500,"Unable to remove like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(201,deleteLike,"removed like successfully")
        )
   }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const likedBy = req.user._id
    if(!commentId){
        throw new ApiError(400,"Could not find video id")
    }
    
    const liked = await Like.findOne({comment:commentId})

    if(!liked){
    const like = await Like.create(
        {
            comment:commentId,
            likedBy
        }
    )
    if(!like){
        throw new ApiError(500,"Could not like the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,like,"Liked the comment")
    )
   } 
   else{
        const deleteLike = await Like.findByIdAndDelete(liked._id)

        if(!deleteLike){
            throw new ApiError(500,"Unable to remove like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(201,deleteLike,"removed like successfully")
        )
   }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const likedBy = req.user._id
    if(!tweetId){
        throw new ApiError(400,"Could not find tweet id")
    }
    
    const liked = await Like.findOne({tweet:tweetId})

    if(!liked){
    const like = await Like.create(
        {
            tweet:tweetId,
            likedBy
        }
    )
    if(!like){
        throw new ApiError(500,"Could not like the tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,like,"Liked the tweet")
    )
   } 
   else{
        const deleteLike = await Like.findByIdAndDelete(liked._id)

        if(!deleteLike){
            throw new ApiError(500,"Unable to remove like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(201,deleteLike,"removed like successfully")
        )
   }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user = req.user
    
    const likedVideos = await Like.aggregate(
        [
            {
                $match:{
                    likedBy
                }
            },
            {
                $project:{
                    video:1
                }
            }

        ]
    )

    if(!likedVideos){
        throw new ApiError(500,"Could not find liked videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,likedVideos,"Fetched liked videos")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}