import { motion, AnimatePresence } from "framer-motion"
import { useAppData } from "../context/AppContext"
import { BiTrash, BiShoppingBag, BiArrowBack, BiMapPin, BiCheckCircle, BiPlus, BiMinus } from "react-icons/bi"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { shopService } from "../main"
import toast from "react-hot-toast"
import { useState } from "react"

const Cart = () => {
    const { cart, subTotal, quantity, fetchCart, loading } = useAppData()
    const navigate = useNavigate()
    const [processing, setProcessing] = useState<string | null>(null)

    const updateQuantity = async (itemId: string, action: 'add' | 'remove' | 'delete') => {
        try {
            setProcessing(itemId)
            const token = localStorage.getItem("token")
            let url = `${shopService}/api/cart/add`
            let method: 'post' | 'delete' = 'post'

            if (action === 'remove') {
                url = `${shopService}/api/cart/remove/${itemId}`
                method = 'delete'
            } else if (action === 'delete') {
                url = `${shopService}/api/cart/delete/${itemId}`
                method = 'delete'
            }

            const config = { headers: { Authorization: `Bearer ${token}` } }
            
            if (method === 'post') {
                // For add, we need shopId too, but our current backend addToCart handles search by itemId
                // Wait, our backend addToCart requires {shopId, itemId} in body.
                // Let's find the shopId from the cart item
                const itemInCart = cart.find(c => c.itemId._id === itemId)
                const shopId = typeof itemInCart?.shopId === 'object' ? itemInCart.shopId._id : itemInCart?.shopId
                await axios.post(url, { shopId, itemId }, config)
            } else {
                await axios.delete(url, config)
            }

            toast.success(`Inventory synchronized`)
            fetchCart()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Logistics error")
        } finally {
            setProcessing(null)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-8">
            <div className="h-12 w-12 border border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.6em]">Securely retrieving your selection...</p>
        </div>
    )

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-12 px-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#D4AF37]/5 blur-3xl rounded-full"></div>
                    <BiShoppingBag className="h-24 w-24 text-[#1F1F1F] relative z-10" />
                </div>
                <div className="text-center space-y-4 max-w-sm">
                    <h2 className="text-3xl font-serif italic text-[#F8F8F8] tracking-widest uppercase">Your Selection is Empty</h2>
                    <p className="text-[11px] text-[#A0A0A0] leading-relaxed tracking-wider opacity-60 uppercase">
                        A sanctuary of quality awaits. Begin your curated collection today.
                    </p>
                </div>
                <button 
                    onClick={() => navigate("/")}
                    className="flex items-center gap-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.5em] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all"
                >
                    <BiArrowBack className="h-4 w-4" />
                    Explore Marketplace
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#A0A0A0] pb-40">
            {/* Header Area */}
            <div className="h-[30vh] flex flex-col items-center justify-center border-b border-[#1F1F1F] bg-[#0A0A0A] px-6 text-center">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-8 bg-[#D4AF37]/30"></div>
                    <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em]">The Selection</span>
                    <div className="h-[1px] w-8 bg-[#D4AF37]/30"></div>
                </div>
                <h1 className="text-5xl font-serif italic text-[#F8F8F8] tracking-[0.2em] uppercase">Checkout</h1>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-20 py-20">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Items ({quantity})</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                            Shop: {typeof cart[0].shopId === 'object' ? cart[0].shopId.name : 'Secured'}
                        </span>
                    </div>

                    <div className="space-y-10">
                        <AnimatePresence>
                            {cart.map((item, idx) => (
                                <motion.div 
                                    key={item._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="group flex flex-col md:flex-row items-center gap-10 bg-[#121212] border border-[#1F1F1F] p-8 rounded-[0.25rem] hover:border-[#D4AF37]/20 transition-all duration-1000 shadow-2xl relative"
                                >
                                    <div className="h-40 w-40 flex-shrink-0 bg-[#0A0A0A] overflow-hidden rounded-[0.25rem] border border-[#1F1F1F]">
                                        <img src={item.itemId.image} alt={item.itemId.name} className="h-full w-full object-contain p-6 mix-blend-lighten" />
                                    </div>

                                    <div className="flex-1 space-y-4 w-full text-center md:text-left">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-serif italic text-[#F8F8F8] tracking-widest uppercase truncate">{item.itemId.name}</h3>
                                            <div className="h-[1px] w-8 bg-[#D4AF37]/40"></div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed tracking-wider opacity-60 line-clamp-2 italic">
                                            "{item.itemId.description || 'Curated for those who appreciate the finer details of craftsmanship.'}"
                                        </p>
                                        <button 
                                            onClick={() => updateQuantity(item.itemId._id, 'delete')}
                                            disabled={processing === item.itemId._id}
                                            className="text-[9px] font-black uppercase tracking-[0.3em] text-red-900 border border-red-900/20 px-4 py-2 rounded-full hover:bg-red-900 hover:text-white transition-all inline-flex items-center gap-2"
                                        >
                                            <BiTrash className="h-3 w-3" />
                                            Discard Item
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                                        <div className="flex flex-col items-center md:items-end">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-3">Quantity</span>
                                            <div className="flex items-center gap-6 bg-[#0A0A0A] border border-[#1F1F1F] px-4 py-2 rounded-full">
                                                <button 
                                                    onClick={() => updateQuantity(item.itemId._id, 'remove')}
                                                    disabled={processing === item.itemId._id}
                                                    className="p-1 hover:text-[#D4AF37] transition-all disabled:opacity-30"
                                                >
                                                    <BiMinus className="h-4 w-4" />
                                                </button>
                                                <span className="text-xs font-black text-[#D4AF37] min-w-[1rem] text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.itemId._id, 'add')}
                                                    disabled={processing === item.itemId._id}
                                                    className="p-1 hover:text-[#D4AF37] transition-all disabled:opacity-30"
                                                >
                                                    <BiPlus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 block mb-1">Value</span>
                                            <span className="text-2xl font-black text-[#F8F8F8] tracking-tighter">₹{item.itemId.price * item.quantity}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Summary / Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-40 bg-[#121212] border border-[#1F1F1F] p-12 rounded-[0.25rem] space-y-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                        <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <BiCheckCircle className="text-[#D4AF37] h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Confirmation</span>
                             </div>
                             <h4 className="text-2xl font-serif italic text-[#F8F8F8] tracking-widest uppercase">The Summary</h4>
                        </div>

                        <div className="space-y-6 border-b border-[#1F1F1F] pb-10">
                            <div className="flex justify-between items-center text-xs tracking-wider">
                                <span className="opacity-40 uppercase font-black text-[9px]">Subtotal</span>
                                <span className="text-[#F8F8F8] font-bold">₹{subTotal}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs tracking-wider">
                                <span className="opacity-40 uppercase font-black text-[9px]">Logistics Fee</span>
                                <span className="text-[#D4AF37] font-black italic">Complimentary</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#F8F8F8]">Total Value</span>
                             <span className="text-4xl font-black text-[#D4AF37] tracking-tighter">₹{subTotal}</span>
                        </div>

                        <button className="w-full py-6 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.6em] transition-all hover:tracking-[0.8em] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            Begin Checkout
                        </button>

                        <div className="space-y-4 pt-6 text-center">
                            <div className="flex items-center justify-center gap-3 opacity-20 group hover:opacity-100 transition-opacity cursor-help">
                                <BiMapPin className="h-4 w-4" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secure Logistics</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
