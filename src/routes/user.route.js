import { Router } from "express";
import { refreshAccessToken, userLogOut, userLogin, userRegister } from "../controllers/user.controller.js";
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
export {router}