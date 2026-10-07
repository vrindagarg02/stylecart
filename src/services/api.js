const API=import.meta.env.VITE_API_URL||"http://localhost:5000/api";
export function getToken(){return localStorage.getItem("token")}
export async function api(path,options={}){const headers={"Content-Type":"application/json",...(options.headers||{})};const token=getToken();if(token)headers.Authorization=`Bearer ${token}`;const res=await fetch(`${API}${path}`,{...options,headers});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||"Request failed");return data}
export const getProducts=(params="")=>api(`/products${params}`);
export const login=(body)=>api("/auth/login",{method:"POST",body:JSON.stringify(body)});
export const register=(body)=>api("/auth/register",{method:"POST",body:JSON.stringify(body)});
