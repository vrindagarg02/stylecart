import mongoose from "mongoose";
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},type:{type:String,enum:["view","search","cart","purchase"]},product:{type:mongoose.Schema.Types.ObjectId,ref:"Product"},query:String,metadata:mongoose.Schema.Types.Mixed},{timestamps:true});
schema.index({user:1,createdAt:-1});
export default mongoose.model("Interaction",schema);
