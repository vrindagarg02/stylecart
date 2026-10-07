import {createContext,useContext,useEffect,useState} from "react"; import {api} from "../services/api";
const CartContext=createContext(); export const useCart=()=>useContext(CartContext);
export function CartProvider({children}){const [cart,setCart]=useState([]); const [loading,setLoading]=useState(true);
const load=()=>api("/cart").then(c=>setCart(c.items||[])).catch(()=>setCart([])).finally(()=>setLoading(false));
useEffect(()=>{if(localStorage.getItem("token"))load();else setLoading(false)},[]);
const addToCart=async(product)=>{const c=await api("/cart",{method:"POST",body:JSON.stringify({productId:product._id||product.id,quantity:1})});setCart(c.items||[]);};
const setQty=async(productId,quantity)=>{if(quantity<=0){const c=await api(`/cart/${productId}`,{method:"DELETE"});setCart(c.items||[])}else{const c=await api(`/cart/${productId}`,{method:"PUT",body:JSON.stringify({quantity})});setCart(c.items||[])}};
const clearCart=async()=>{await api("/cart",{method:"DELETE"});setCart([])};
return <CartContext.Provider value={{cart,loading,addToCart,setQty,clearCart,reload:load}}>{children}</CartContext.Provider>}
