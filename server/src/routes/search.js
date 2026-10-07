import {Router} from "express"; import {aiSearch} from "../services/ai.js"; import Interaction from "../models/Interaction.js"; import {auth} from "../middleware/auth.js";
const r=Router();
r.get("/",auth(false),async(req,res)=>{const q=(req.query.q||"").trim();if(!q)return res.json({intent:{},results:[]});if(req.user)Interaction.create({user:req.user._id,type:"search",query:q}).catch(()=>{});res.json(await aiSearch(q))});
export default r;
