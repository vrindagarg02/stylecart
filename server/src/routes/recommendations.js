import {Router} from "express"; import {auth} from "../middleware/auth.js"; import {aiRecommend} from "../services/ai.js";
const r=Router(); r.get("/",auth(),async(req,res)=>res.json({recommendations:await aiRecommend(req.user._id)})); export default r;
