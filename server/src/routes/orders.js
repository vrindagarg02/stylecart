import {Router} from "express"; import Cart from "../models/Cart.js"; import Product from "../models/Product.js"; import Order from "../models/Order.js"; import Interaction from "../models/Interaction.js"; import {auth,admin} from "../middleware/auth.js"; import {calculateRisk} from "../utils/risk.js"; import {recordOrderOnChain,verifyOrderOnChain} from "../services/blockchain.js";
const r=Router();
r.post("/",auth(),async(req,res)=>{try{
 const c=await Cart.findOne({user:req.user._id}).populate("items.product"); if(!c||!c.items.length)return res.status(400).json({message:"Cart is empty"});
 const products=c.items.map(i=>({product:i.product._id,name:i.product.name,price:i.product.price,quantity:i.quantity}));
 for(const i of c.items)if(i.quantity>i.product.stock)return res.status(400).json({message:`Insufficient stock for ${i.product.name}`});
 const total=products.reduce((s,i)=>s+i.price*i.quantity,0);
 const prior=await Order.countDocuments({user:req.user._id});
 const risk=calculateRisk({user:req.user,order:{totalAmount:total},previousOrders:prior});
 const order=await Order.create({user:req.user._id,products,totalAmount:total,shippingAddress:req.body.shippingAddress||{},paymentStatus:req.body.transactionId ? "Paid" : "Pending",orderStatus:req.body.transactionId ? "Confirmed" : "Pending",transactionId:req.body.transactionId,...risk});
 for(const i of c.items){await Product.findByIdAndUpdate(i.product._id,{$inc:{stock:-i.quantity,salesCount:i.quantity}});await Interaction.create({user:req.user._id,type:"purchase",product:i.product._id});}
 await Cart.findOneAndUpdate({user:req.user._id},{items:[]});
 const chain=await recordOrderOnChain(order); order.blockchainHash=chain.hash; if(chain.transactionId)order.transactionId=order.transactionId||chain.transactionId; await order.save();
 res.status(201).json(order);
}catch(e){console.error(e);res.status(500).json({message:"Order creation failed"})}});
r.get("/my-orders",auth(),async(req,res)=>res.json(await Order.find({user:req.user._id}).populate("products.product").sort({createdAt:-1})));

r.get("/admin/all",auth(),admin,async(req,res)=>res.json(await Order.find().populate("user","name email").sort({createdAt:-1})));
r.get("/:id",auth(),async(req,res)=>{const o=await Order.findById(req.params.id).populate("products.product");if(!o)return res.status(404).json({message:"Order not found"});if(String(o.user)!==String(req.user._id)&&req.user.role!=="admin")return res.status(403).json({message:"Forbidden"});res.json(o)});
r.get("/:id/blockchain",auth(),async(req,res)=>{const o=await Order.findById(req.params.id);if(!o)return res.status(404).json({message:"Order not found"});if(String(o.user)!==String(req.user._id)&&req.user.role!=="admin")return res.status(403).json({message:"Forbidden"});res.json(await verifyOrderOnChain(o))});

r.put("/admin/:id/status",auth(),admin,async(req,res)=>{const allowed=["Pending","Confirmed","Shipped","Out for Delivery","Delivered","Cancelled"];if(!allowed.includes(req.body.status))return res.status(400).json({message:"Invalid status"});const o=await Order.findByIdAndUpdate(req.params.id,{orderStatus:req.body.status},{new:true});if(!o)return res.status(404).json({message:"Order not found"});res.json(o)});
export default r;
