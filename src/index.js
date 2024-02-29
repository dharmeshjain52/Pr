import { app } from './app.js'
import connectDB from './db/db.js'
import dotenv from 'dotenv'


dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR",error)
        throw error
    })
    app.listen(process.env.PORT,()=>{
        console.log(`SERVER RUNNING AT PORT:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("DB CONNECTION FAILED")
})