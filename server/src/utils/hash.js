import crypto from "crypto";
export function orderSummary(order){
  return JSON.stringify({id:String(order._id),user:String(order.user),products:order.products.map(x=>({product:String(x.product),quantity:x.quantity,price:x.price})),totalAmount:order.totalAmount,shippingAddress:order.shippingAddress});
}
export function orderHash(order){return "0x"+crypto.createHash("sha256").update(orderSummary(order)).digest("hex");}
