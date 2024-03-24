import { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscriptions.models.js"
import { ApiResponse } from "../utils/Apiresponse.js"
import { ApiError } from "../utils/Apierror.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    // if(!isValidObjectId(channelId)){
    //     throw new ApiError(400,"Invalid id")
    // }
    try {
        const userId = req.user._id
        const credential = {subscription:userId,channel:channelId}

        const subscribed = await Subscription.findOne(credential)

        if(!subscribed){
            const subcriber = await Subscription.create(credential)

            if(!subcriber){
                throw new ApiError(500,"unable to subscribe channel")
            }

            return res
            .status(200)
            .json(
                new ApiResponse(201,subcriber,"Subscribed successfully")
            )
        }

        else{
            const deleteSubscriber = await Subscription.deleteOne(credential)

            if(!deleteSubscriber){
                throw new ApiError(500,"unable to unsubscribe channel")
            }

            return res
            .status(200)
            .json(
                new ApiResponse(201,deleteSubscriber,"Unsubscribed Successfully")
            )
        }
    } 
    catch (error) {
        throw new ApiError(500,error?.message)
    }
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel Id")
    }

    const registeredUser = await User.findById(channelId)

    if(!registeredUser){
        throw new ApiError(400,"User not found")
    }

    const user = await Subscription.aggregate([
        {
            $match:{
                channel:registeredUser._id
            }
        },
        {
            $project:{
                subscription:1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Channel subscribers")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const  { subscriberId }= req.params

    // if(!isValidObjectId(channelId)){
    //     throw new ApiError(400,"Invalid channel Id")
    // }
    const registeredUser = await User.findById(subscriberId)

    if(!registeredUser){
        throw new ApiError(400,"User not found")
    }

    const user = await Subscription.aggregate([
        {
            $match:{
                subscription:registeredUser._id
            }
        },
        {
            $project:{
                channel:1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Channels subscribed to")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}