import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { shopService } from "../main"
import { motion, AnimatePresence } from "framer-motion"
import { BiMapPin, BiShoppingBag, BiArrowBack, BiCrown } from "react-icons/bi"
import { useAppData } from "../context/AppContext"
import toast from "react-hot-toast"

const ShopPage = () => {

    const { id } = useParams()

    const navigate = useNavigate()

    const { isAuth, user, fetchCart } = useAppData()

    const [shop, setShop] = useState(null)

    const [items, setItems] = useState([])

    const [loading, setLoading] = useState(true)

    const [addingToCart, setAddingToCart] = useState(null)

    const fetchData = async () => {

        try {

            setLoading(true)

            const headers = {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }

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

    const addToCart = async (itemId) => {

        if (!isAuth) {
            return toast.error("Please login to start shopping")
        }

        if (user?.role !== "customer") {
            return toast.error("Only customers can purchase items")
        }

        try {

            setAddingToCart(itemId)

            const token = localStorage.getItem("token")

            const { data } = await axios.post(
                `${shopService}/api/cart/add`,
                { shopId: id, itemId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            toast.success(data.message || "Exclusive item added to cart")

            fetchCart()

        } catch (error) {

            console.error(error)

            toast.error(error.response?.data?.message || "Failed to add item")

        } finally {

            setAddingToCart(null)

        }
    }

    useEffect(() => {

        if (id) {
            fetchData()
        }

    }, [id])

    if (loading) {

        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-8">

                <div className="h-12 w-12 border border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>

                <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.6em]">
                    Authorized Access Only
                </p>

            </div>
        )
    }

    if (!shop) return null

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#A0A0A0] pb-32">

            {/* Shop Banner */}
            <div className="relative h-[50vh] w-full border-b border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
                <img
                    src={shop.image}
                    alt={shop.name}
                    className="h-full w-full object-cover mix-blend-lighten scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>

                <div className="absolute bottom-10 left-10 right-10 z-10 space-y-3">
                    <div className="flex items-center gap-3">
                        <BiCrown className="h-4 w-4 text-[#D4AF37]" />
                        <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em]">Shop</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#F8F8F8] italic tracking-[0.2em] uppercase">{shop.name}</h1>
                    {shop.autoLocation?.formattedAddress && (
                        <div className="flex items-center gap-2 text-[#A0A0A0]">
                            <BiMapPin className="h-3 w-3 text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{shop.autoLocation.formattedAddress}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Shop Description */}
            {shop.description && (
                <div className="max-w-5xl mx-auto px-6 py-10 border-b border-[#1F1F1F]">
                    <p className="text-[13px] text-[#A0A0A0] italic leading-relaxed tracking-wider">
                        "{shop.description}"
                    </p>
                </div>
            )}

            {/* Items Grid */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">
                        Items ({items.length})
                    </span>
                    <div className="flex-1 h-[1px] bg-[#1F1F1F]"></div>
                </div>

                {items.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <BiShoppingBag className="h-16 w-16 text-[#1F1F1F] mx-auto" />
                        <p className="text-sm text-[#666] uppercase tracking-widest">No items available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`group bg-[#121212] border border-[#1F1F1F] rounded-lg overflow-hidden hover:border-[#D4AF37]/30 transition-all ${!item.isAvailable ? 'opacity-50' : ''}`}
                                >
                                    {/* Item Image */}
                                    <div className="relative h-56 bg-[#0A0A0A] overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className={`h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105 ${!item.isAvailable ? 'grayscale' : ''}`}
                                        />
                                        {!item.isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/60">
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] border border-red-500/20 px-4 py-2">
                                                    Unavailable
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Info */}
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="text-lg font-serif text-[#F8F8F8] italic tracking-widest uppercase truncate">
                                                {item.name}
                                            </h3>
                                            <div className="h-[1px] w-8 bg-[#D4AF37]/40 mt-2"></div>
                                        </div>

                                        {item.description && (
                                            <p className="text-[11px] text-[#A0A0A0] leading-relaxed tracking-wider line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-xl font-black text-[#D4AF37] tracking-tighter">
                                                ₹{item.price}
                                            </span>

                                            {item.isAvailable && (
                                                <button
                                                    onClick={() => addToCart(item._id)}
                                                    disabled={addingToCart === item._id}
                                                    className="text-[10px] font-black text-[#D4AF37] border border-[#D4AF37]/20 px-5 py-2.5 rounded-full hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all uppercase tracking-[0.2em] disabled:opacity-40"
                                                >
                                                    {addingToCart === item._id ? "Adding..." : "Add to Cart"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Back button */}
            <div className="max-w-5xl mx-auto px-6 pt-4">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-3 text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.3em] hover:text-[#D4AF37] transition-colors"
                >
                    <BiArrowBack className="h-4 w-4" />
                    Back to Shops
                </button>
            </div>

        </div>
    )
}

export default ShopPage