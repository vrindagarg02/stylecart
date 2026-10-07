import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import { orderHash } from "../utils/hash.js";
const abi=["function recordOrderHash(bytes32 orderHash)","function verifyOrderHash(bytes32 orderHash) view returns (bool,uint256)"];
export async function recordOrderOnChain(order){
  const hash=orderHash(order);
  if(!process.env.BLOCKCHAIN_RPC_URL || !process.env.BLOCKCHAIN_PRIVATE_KEY || !process.env.ORDER_VERIFICATION_ADDRESS) return {hash,transactionId:null,available:false};
  try{
    const provider=new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const wallet=new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY,provider);
    const contract=new ethers.Contract(process.env.ORDER_VERIFICATION_ADDRESS,abi,wallet);
    const tx=await contract.recordOrderHash(hash);
    await tx.wait();
    return {hash,transactionId:tx.hash,available:true};
  }catch(e){ console.error("Blockchain recording failed:",e.message); return {hash,transactionId:null,available:false};}
}
export async function verifyOrderOnChain(order){
  const hash=orderHash(order);
  if(!process.env.BLOCKCHAIN_RPC_URL || !process.env.ORDER_VERIFICATION_ADDRESS) return {hash,verified:false,available:false};
  try{
    const provider=new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const contract=new ethers.Contract(process.env.ORDER_VERIFICATION_ADDRESS,abi,provider);
    const [verified,timestamp]=await contract.verifyOrderHash(hash);
    return {hash,verified,recordedAt:Number(timestamp),available:true};
  }catch(e){return {hash,verified:false,available:false,error:e.message};}
}
