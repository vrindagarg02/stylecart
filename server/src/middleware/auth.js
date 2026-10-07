import jwt from "jsonwebtoken";
import User from "../models/User.js";
export function auth(required=true){
  return async (req,res,next)=>{
    try{
      const token=(req.headers.authorization||"").replace("Bearer ","");
      if(!token){ if(required)return res.status(401).json({message:"Authentication required"}); return next(); }
      const payload=jwt.verify(token,process.env.JWT_SECRET);
      req.user=await User.findById(payload.id).select("-password");
      if(!req.user)return res.status(401).json({message:"User not found"});
      next();
    }catch(e){return res.status(401).json({message:"Invalid or expired token"});}
  };
}
export function admin(req,res,next){ if(req.user?.role!=="admin") return res.status(403).json({message:"Admin access required"}); next(); }
