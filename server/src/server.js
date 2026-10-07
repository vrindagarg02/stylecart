import "dotenv/config"; import express from "express"; import cors from "cors"; import rateLimit from "express-rate-limit";
import {connectDB} from "./config/db.js";
import auth from "./routes/auth.js"; import users from "./routes/users.js"; import products from "./routes/products.js"; import cart from "./routes/cart.js"; import orders from "./routes/orders.js"; import admin from "./routes/admin.js"; import recommendations from "./routes/recommendations.js"; import search from "./routes/search.js"; import fraud from "./routes/fraud.js"; import ai from "./routes/ai.js"; import payment from "./routes/payment.js";
const app=express(); app.use(cors({origin:process.env.CLIENT_URL||"http://localhost:5173"})); app.use(express.json({limit:"1mb"})); app.use(rateLimit({windowMs:15*60*1000,max:300}));
app.get("/health",(req,res)=>res.json({status:"ok",service:"stylecart-server",database:!!process.env.MONGO_URI}));
app.use("/api/auth",auth); app.use("/api/users",users); app.use("/api/products",products); app.use("/api/cart",cart); app.use("/api/orders",orders); app.use("/api/admin",admin); app.use("/api/recommendations",recommendations); app.use("/api/search",search); app.use("/api/fraud",fraud); app.use("/api/ai",ai); app.use("/api/payment",payment);
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:"Unexpected server error"})});
const port=process.env.PORT||5000; await connectDB(); app.listen(port,()=>console.log(`StyleCart API running on http://localhost:${port}`));
