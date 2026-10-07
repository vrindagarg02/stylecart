import {Router} from "express"; import Order from "../models/Order.js"; import {auth,admin} from "../middleware/auth.js";
const r=Router(); r.get("/:orderId",auth(),admin,async(req,res)=>{const o=await Order.findById(req.params.orderId);if(!o)return res.status(404).json({message:"Order not found"});res.json({riskScore:o.riskScore,riskLevel:o.riskLevel,reasons:o.riskReasons})}); export default r;
