import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext"
const Cart = ()=>{
    const {cart,subTotal,quantity,fetchCart} = useAppData();
    const navigate = useNavigate();
    const {loadingItemId,setLoadingItemId}=useState<string | null>(null)
    const {clearingCart,setClearingCart}=useState<boolean>(false);
    const handleQuantityChange = async(itemId:string,newQuantity:number)=>{
        setLoadingItemId(itemId);
        try{
            await updateCartQuantity(itemId,newQuantity)
        }catch(error){
            console.log(error)
        }finally{
            setLoadingItemId(null)
        }
    }
    const handleRemoveFromCart = async(itemId:string)=>{
        setLoadingItemId(itemId)
        try{
            await removeFromCart(itemId)
        }catch(error){
            console.log(error)
        }finally{
            setLoadingItemId(null)
        }
    }
    return(
        <div>
            <h1>Cart</h1>
        </div>
    )
}

export default Cart