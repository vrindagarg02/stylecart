export function calculateRisk({user,order,failedPayments=0,previousOrders=0}){
  let score=0,reasons=[];
  if(previousOrders===0){score+=25; reasons.push("New account");}
  if(order.totalAmount>=5000){score+=30; reasons.push("High-value order");}
  else if(order.totalAmount>=3000){score+=15; reasons.push("Above-average order value");}
  if(failedPayments>=2){score+=30; reasons.push("Multiple failed payment attempts");}
  if(previousOrders>=5 && order.totalAmount>=3000){score+=15; reasons.push("Unusually frequent high-value purchasing");}
  score=Math.min(100,score);
  return {riskScore:score,riskLevel:score>=70?"High":score>=40?"Medium":"Low",riskReasons:reasons.length?reasons:["No major anomaly signals"]};
}
