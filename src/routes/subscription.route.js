import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()

router.use(verifyJWT)


router.route('/toggle/subscribe/:channelId').get(toggleSubscription)

router.route('/get-subscribers/:channelId').get(getUserChannelSubscribers)

router.route('/get-subscribed-to/:subscriberId').get(getSubscribedChannels)

export default router
