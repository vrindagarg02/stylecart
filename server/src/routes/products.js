import {Router} from "express"; import Product from "../models/Product.js"; import {auth,admin} from "../middleware/auth.js";
const r=Router();
r.get("/",async(req,res)=>{try{const {category,search}=req.query;const q={};if(category&&category!=="All")q.category=category;if(search)q.$text={$search:search};res.json(await Product.find(q).sort({createdAt:-1}))}catch(e){res.status(500).json({message:"Unable to load products"})}});
r.get("/:id",async(req,res)=>{const p=await Product.findById(req.params.id);if(!p)return res.status(404).json({message:"Product not found"});res.json(p)});
r.post("/",auth(),admin,async(req,res)=>{try{res.status(201).json(await Product.create(req.body))}catch(e){res.status(400).json({message:"Invalid product data"})}});
r.put("/:id",auth(),admin,async(req,res)=>{try{const p=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!p)return res.status(404).json({message:"Product not found"});res.json(p)}catch(e){res.status(400).json({message:"Invalid product data"})}});
r.delete("/:id",auth(),admin,async(req,res)=>{const p=await Product.findByIdAndDelete(req.params.id);if(!p)return res.status(404).json({message:"Product not found"});res.json({message:"Product deleted"})});
export default r;
