import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/Apierror.js'
import {ApiResponse} from '../utils/Apiresponse.js'
import {Tweet} from '../models/tweet.model.js'



const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const owner = req.user._id

    if(!content){
        throw new ApiError(400,"Content of tweet not found")
    }

    const tweet = await Tweet.create(
        {
            content,
            owner
        }
    )

    if(!tweet){
        throw new ApiError(500,"Error while creating tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,tweet,"Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id

    const userTweets = await Tweet.aggregate([
        {
            $match:{
                owner:userId
            }
        },
        {
            $project:{
                content:1
            }
        }
    ])

    if(!userTweets){
        throw new ApiError(500,"Could not fetch user tweets")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,userTweets,"Tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if(!tweetId){
        throw new ApiError(400,"Could not find tweet Id")
    }

    if(!content){
        throw new ApiError(400,"Content could not be found")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                    content
                 }
        },
        { new :true}
    )

    if(!tweet){
        throw new ApiError(400,"Could not find tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,tweet,"Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400,"Invalid tweet params")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet){
        throw new ApiError(400,"Could not find tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,deletedTweet,"Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}