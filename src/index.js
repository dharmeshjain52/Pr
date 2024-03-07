import { app } from './app.js'
import connectDB from './db/db.js'
import dotenv from 'dotenv'


dotenv.config({
    path:'./env'
})
const port =8000 || process.env.PORT
connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR",error)
        throw error
    })
    app.listen(port,()=>{
        console.log(`SERVER RUNNING AT PORT:${port}`)
    })
})
.catch((err)=>{
    console.log("DB CONNECTION FAILED")
})