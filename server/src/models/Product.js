import mongoose from "mongoose";
const schema=new mongoose.Schema({
  legacyId:{type:Number,index:true},
  name:{type:String,required:true},
  description:String, price:{type:Number,required:true,min:0},
  category:String,image:String,stock:{type:Number,default:25,min:0},
  tags:{type:[String],default:[]},rating:{type:Number,default:4.2,min:0,max:5},
  salesCount:{type:Number,default:0}
},{timestamps:true});
schema.index({name:"text",description:"text",category:"text",tags:"text"});
export default mongoose.model("Product",schema);
