import mongoose from "mongoose";
export async function connectDB() {
  const uri=process.env.MONGO_URI;
  if(!uri){ console.warn("MONGO_URI missing; API will start but DB features are unavailable."); return false; }
  try { await mongoose.connect(uri); console.log("MongoDB connected"); return true; }
  catch(e){ console.error("MongoDB connection failed:",e.message); return false; }
}
