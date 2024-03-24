import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
     credentials:true
}))

app.use(express.json({limit:'15kb'}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

app.use(cookieParser())

import {router} from './routes/user.route.js'
import videoRouter from './routes/videos.routes.js'
import subscriptionRouter from './routes/subscription.route.js'
import commentRouter from './routes/comment.route.js'
import likesRouter from './routes/likes.route.js'

app.use("/api/v1/users",router)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/like",likesRouter)

export {app} 