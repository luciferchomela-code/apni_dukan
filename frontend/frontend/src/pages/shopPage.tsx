import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { shopService } from "../main"
import { motion, AnimatePresence } from "framer-motion"
import { BiMapPin, BiShoppingBag, BiArrowBack, BiCrown } from "react-icons/bi"
import toast from "react-hot-toast"

interface Shop {
    _id: string;
    name: string;
    description: string;
    image: string;
    isOpen: boolean;
    autoLocation: {
        formattedAddress: string;
    };
}

interface Item {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
}

const ShopPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [shop, setShop] = useState<Shop | null>(null)
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const fetchData = async () => {
        try {
            setLoading(true)
            const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` }
            
            // Parallel fetch for shop & items
            const [shopRes, itemsRes] = await Promise.all([
                axios.get(`${shopService}/api/shop/${id}`, { headers }),
                axios.get(`${shopService}/api/item/all/${id}`, { headers })
            ])

            setShop(shopRes.data.shop)
            setItems(itemsRes.data.items)
        } catch (error) {
            console.error("Data fetch error:", error)
            toast.error("Failed to load shop details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-8">
                <div className="h-12 w-12 border border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
                <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.6em]">Authorized Access Only</p>
            </div>
        )
    }

    if (!shop) return null

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#A0A0A0] pb-32">
            {/* Header / Hero Area */}
            <div className="relative h-[50vh] w-full border-b border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
                <img 
                    src={shop.image} 
                    alt={shop.name} 
                    className="h-full w-full object-contain mix-blend-lighten scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-10 left-10 p-5 rounded-full bg-[#121212] border border-[#1F1F1F] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all z-50 group"
                >
                    <BiArrowBack className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="absolute bottom-16 left-10 lg:left-24 right-10 z-30 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
                        <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em]">Featured Establishment</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-serif italic text-[#F8F8F8] tracking-widest uppercase">{shop.name}</h1>
                    <div className="flex items-center gap-6 text-xs bg-[#121212]/50 backdrop-blur-md w-fit px-8 py-4 border border-[#1F1F1F] rounded-full shadow-2xl">
                        <div className="flex items-center gap-3">
                            <BiMapPin className="text-[#D4AF37]" />
                            <span className="tracking-widest uppercase font-black text-[9px]">{shop.autoLocation.formattedAddress}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-[#1F1F1F]"></div>
                        <div className="flex items-center gap-3">
                             <div className={`h-2 w-2 rounded-full ${shop.isOpen ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' : 'bg-red-900'}`}></div>
                             <span className="tracking-widest uppercase font-black text-[9px]">{shop.isOpen ? 'Currently Open' : 'Closed Now'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-4 gap-20">
                {/* Shop Intent Sidebar */}
                <div className="lg:col-span-1 space-y-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <BiCrown className="text-[#D4AF37] h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Identity</span>
                        </div>
                        <p className="text-[13px] italic leading-relaxed tracking-wider border-l border-[#1F1F1F] pl-8 py-2">
                           "{shop.description || 'A sanctuary of quality and precision, serving this neighborhood with excellence and care.'}"
                        </p>
                    </div>

                    <div className="p-8 bg-[#121212] border border-[#1F1F1F] rounded-[0.25rem] space-y-8 shadow-2xl">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F8F8F8]">Contact Details</h4>
                         <div className="space-y-4">
                             <p className="text-xs tracking-wider opacity-60">Customer support available during business hours.</p>
                             <button className="w-full py-5 bg-transparent border border-[#1F1F1F] text-[10px] font-black uppercase tracking-[0.4em] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                                Send Message
                             </button>
                         </div>
                    </div>
                </div>

                {/* Main Collection Grid */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-16 border-b border-[#1F1F1F] pb-10">
                         <div className="space-y-2">
                            <h2 className="text-3xl font-serif italic text-[#F8F8F8] tracking-widest uppercase">The Inventory</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Showing {items.length} available items</p>
                         </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="py-40 flex flex-col items-center justify-center space-y-6 bg-[#121212]/30 border border-dashed border-[#1F1F1F] rounded-[0.5rem]">
                            <BiShoppingBag className="h-10 w-10 text-[#1F1F1F]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Selection unavailable at this moment</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            <AnimatePresence>
                                {items.filter(i => i.isAvailable).map((item, idx) => (
                                    <motion.div 
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-[#121212] border border-[#1F1F1F] rounded-[0.25rem] overflow-hidden hover:border-[#D4AF37]/20 transition-all duration-1000 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="relative h-72 bg-[#0A0A0A] overflow-hidden">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-contain p-10 mix-blend-lighten transition-transform duration-1000 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 pointer-events-none"></div>
                                        </div>
                                        
                                        <div className="p-10 space-y-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-serif italic text-[#F8F8F8] tracking-widest uppercase group-hover:text-[#D4AF37] transition-colors">{item.name}</h3>
                                                    <div className="h-[1px] w-6 bg-[#D4AF37]/30"></div>
                                                </div>
                                                <span className="text-lg font-black text-[#D4AF37] tracking-tighter">₹{item.price}</span>
                                            </div>

                                            <p className="text-[11px] leading-relaxed tracking-wider line-clamp-2 opacity-60">
                                                {item.description || "A premium selection curated for excellence and long-lasting satisfaction."}
                                            </p>

                                            <button className="w-full py-5 flex items-center justify-center gap-4 bg-[#0A0A0A] border border-[#1F1F1F] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#0A0A0A] transition-all duration-500 overflow-hidden group/btn relative">
                                                <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                                                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] group-hover/btn:text-[#0A0A0A]">Add To Cart</span>
                                                <BiShoppingBag className="relative z-10 h-4 w-4 group-hover/btn:text-[#0A0A0A]" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShopPage