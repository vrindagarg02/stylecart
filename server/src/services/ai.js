import axios from "axios";
import Product from "../models/Product.js";
import Interaction from "../models/Interaction.js";
const AI_URL=process.env.AI_SERVICE_URL||"http://127.0.0.1:8000";
export async function aiRecommend(userId){
  const products=await Product.find().lean();
  const history=await Interaction.find({user:userId,product:{$ne:null}}).sort({createdAt:-1}).limit(30).populate("product").lean();
  const seen=[]; const ids=new Set();
  for(const h of history){if(h.product && !ids.has(String(h.product._id))){ids.add(String(h.product._id));seen.push(map(h.product));}}
  try{
    const r=await axios.post(`${AI_URL}/recommend`,{products:products.map(map),history:seen,limit:6},{timeout:5000});
    return r.data.recommendations;
  }catch(e){
    return products.sort((a,b)=>(b.salesCount||0)-(a.salesCount||0)).slice(0,6).map(p=>({product:map(p),score:null}));
  }
}
export async function aiSearch(q){
  const products=await Product.find().lean();
  try{
    return (await axios.post(`${AI_URL}/search`,{products:products.map(map),query:q,limit:30},{timeout:5000})).data;
  }catch(e){
    const words=q.toLowerCase().split(/\s+/);
    const results=products.filter(p=>words.some(w=>`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(w))).slice(0,30);
    return {intent:{},results:results.map(p=>({product:map(p),score:null})),method:"fallback keyword search"};
  }
}
function map(p){return {id:String(p._id),name:p.name,description:p.description||"",category:p.category||"",tags:p.tags||[],price:p.price,image:p.image,stock:p.stock};}
