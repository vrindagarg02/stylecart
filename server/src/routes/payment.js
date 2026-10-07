import {Router} from "express"; import Stripe from "stripe"; import {auth} from "../middleware/auth.js";
const r=Router();
r.post("/create-intent",auth(),async(req,res)=>{
 const amount=Math.round(Number(req.body.amount||0)*100); if(!amount)return res.status(400).json({message:"Invalid amount"});
 if(!process.env.STRIPE_SECRET_KEY)return res.json({mode:"demo",clientSecret:null,message:"Stripe is not configured. Add STRIPE_SECRET_KEY for Stripe test mode."});
 try{const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);const intent=await stripe.paymentIntents.create({amount,currency:"inr",automatic_payment_methods:{enabled:true},metadata:{userId:String(req.user._id)}});res.json({mode:"stripe",clientSecret:intent.client_secret,id:intent.id});}
 catch(e){res.status(503).json({message:"Payment provider unavailable"})}
});
export default r;
