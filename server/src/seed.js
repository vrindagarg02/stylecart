import "dotenv/config"; import mongoose from "mongoose"; import Product from "./models/Product.js"; import User from "./models/User.js"; import bcrypt from "bcryptjs"; import {products} from "../../src/data/products.js";
await mongoose.connect(process.env.MONGO_URI);
const docs=products.map(p=>({legacyId:p.id,name:p.name,price:p.price,category:p.category,description:p.description,image:p.image,stock:25,tags:[p.category,p.name.toLowerCase().replace(/[^a-z0-9 ]/g,"")],rating:4.2,salesCount:0}));
for(const p of docs) await Product.updateOne({legacyId:p.legacyId},{$set:p},{upsert:true});
if(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD){const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);await User.updateOne({email:process.env.ADMIN_EMAIL},{$set:{name:"StyleCart Admin",email:process.env.ADMIN_EMAIL,password:hash,role:"admin"}},{upsert:true});}
console.log(`Seeded ${docs.length} products`); await mongoose.disconnect();
