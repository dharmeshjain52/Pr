import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema(
{
    videoFile:{
       public_id:{
        type:String,
        required:true
       },
       url:{
        type:String,
        required:true
    },
    },
    thumbnail:{
        public_id:{
            type:String,
           },
           url:{
            type:String,
           }
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String
    },
    duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)