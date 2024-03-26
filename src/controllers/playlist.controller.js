import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiResponse} from '../utils/Apiresponse.js'
import {ApiError} from '../utils/Apierror.js'
import {Playlist} from '../models/playlist.model.js'
import { Video } from '../models/video.model.js'
import mongoose from 'mongoose'

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const owner = req.user._id
    //TODO: create playlist
    if(!name){
        throw new ApiError(400,"Name for playlist not found")
    }

    const playlist = await Playlist.create(
        {
            name,
            description,
            owner
        }
    )

    if(!playlist){
        throw new ApiError(500,"Could not create playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,playlist,"Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user._id
    //TODO: get user playlists

    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner:userId
            }
        },
        {
            $project:{
                name:1
            }
        }
    ])

    if(!playlists){
        throw new ApiError(500,"Could not fetch playlists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,playlists,"Playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId){
        throw new ApiError(400,"Could not find playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Could not find the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,playlist,"Playlist found")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!playlistId){
        throw new ApiError(400,"Playlist Id not found")
    }
    if(!videoId){
        throw new ApiError(400,"video id not found")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"could not find video")
    }
    
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{
                videos:videoId
            }
        },
        { new : true}
    )

    if(!playlist){
        throw new ApiError(400,"Could not find playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,playlist,"Video added to playlist")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId){
        throw new ApiError(400,"Could not find playlist id")
    }

    if(!videoId){
        throw new ApiError(400,"Could not find video id")
    }

    const video = await Video.findById(videoId)
    const object = new mongoose.mongo.ObjectId(videoId)
    if(!video){
        throw new ApiError(404,"could not find video")
    }
    
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:object
            }
        },
        { new : true}
    )

    if(!playlist){
        throw new ApiError(400,"Could not find playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,playlist,"Video deleted from playlist")
    )
    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"Could not find playlist id")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(400,"Could not find playlist")
    }

    return res
    .status(200)
    .json(
        new ApiError(201,deletedPlaylist,"Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
        throw new ApiError(400,"Could not find playlist id")
    }

    if(!name && !description){
        throw new ApiError(400,"name and description not found")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },
        { new :true }
    )

    if(!playlist){
        throw new ApiError(400,"Could not find playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,playlist,"Details updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}