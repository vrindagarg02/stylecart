import mongoose from "mongoose";
const schema=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  products:[{product:{type:mongoose.Schema.Types.ObjectId,ref:"Product"},name:String,price:Number,quantity:Number}],
  totalAmount:Number,shippingAddress:{name:String,address:String,city:String,state:String,pincode:String,phone:String},
  paymentStatus:{type:String,enum:["Pending","Paid","Failed"],default:"Pending"},
  orderStatus:{type:String,enum:["Pending","Confirmed","Shipped","Out for Delivery","Delivered","Cancelled"],default:"Pending"},
  transactionId:String,blockchainHash:String,riskScore:Number,riskLevel:String,riskReasons:[String]
},{timestamps:true});
export default mongoose.model("Order",schema);
