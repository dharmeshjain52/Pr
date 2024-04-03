import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, publishAVideo, togglePublishStatus, updateVideo ,getVideoById, getAllVideos} from "../controllers/video.controller.js";


const router = Router()

router.use(verifyJWT)

router.route('/').get(getAllVideos)
router.route("/publish-video").post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishAVideo
)

router.route('/:videoId')
        .get(getVideoById)
        .patch(upload.single("thumbnailLocalPath"),updateVideo)
        .delete(deleteVideo)

router.route('/toggle/publish/:videoId').patch(togglePublishStatus)

export default router