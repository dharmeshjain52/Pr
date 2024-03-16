import { Router } from "express";
import { changePassword, 
         getCurrentUser, 
         getUserChannelProfile, 
         getUserWatchHistory, 
         refreshAccessToken, 
         updateAvatar, 
         updateCoverImage, 
         updateInfo, 
         userLogOut, 
         userLogin, 
         userRegister 
        } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    ,userRegister)
router.route('/login').post(userLogin)
router.route('/logout').post(verifyJWT,userLogOut)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT,changePassword)
router.route('/current-user').get(verifyJWT,getCurrentUser)
router.route('/update-info').patch(verifyJWT,updateInfo)
router.route('/update-avatar').patch(verifyJWT,upload.single("avatar"),updateAvatar)
router.route('/update-cover-image').patch(verifyJWT,upload.single("coverImage"),updateCoverImage)
router.route('/c/:username').get(verifyJWT,getUserChannelProfile)
router.route('/history').get(verifyJWT,getUserWatchHistory)
export {router}