import { useEffect, useState } from "react";
import axios from "axios";
import { shopService } from "../main";
import AddShop from "./AddShop";
import ShopProfile from "./ShopProfile"; 
import Items from "../components/Items.tsx";
import AddItem from "../components/AddItem.tsx";
import { motion, AnimatePresence } from "framer-motion";
const Shop = () => {
    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [tab,setTab] = useState<sellerTab>("menu")
    type sellerTab = "menu"|"add-item"|"sales"

    const fetchMyShop = async () => {
        try {
            const { data } = await axios.get(
                `${shopService}/api/shop/my`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setShop(data.shop || null);
            
            // Token refresh logic
            if (data.token && data.token !== localStorage.getItem("token")) {
                localStorage.setItem("token", data.token);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error fetching shop:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyShop();
    }, []);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-[3px] border-indigo-50"></div>
                    <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>
                </div>
                <div className="space-y-1 text-center">
                    <p className="text-gray-900 font-black text-lg tracking-tight">Apni Dukan</p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Setting up your shop...</p>
                </div>
            </div>
        </div>
    );

    if (!shop) {
        return <AddShop fetchMyShop={fetchMyShop} />;
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-4 py-32 sm:px-8">
            <ShopProfile shop={shop} isSeller={true} onUpdate={fetchMyShop} />
            
            <div className="min-w-5xl mx-auto space-y-12">
                <div className="bg-[#121212] border border-[#1F1F1F] rounded-[0.5rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-1/4 w-[1px] h-full bg-[#1F1F1F]/50"></div>
                    <div className="absolute top-0 right-1/2 w-[1px] h-full bg-[#1F1F1F]/50"></div>

                    <div className="flex bg-[#0A0A0A] border-b border-[#1F1F1F]">
                        {[
                            {key:"menu",label:"Menu Item"},
                            {key:"add-item",label:"Add Item"},
                            {key:"sales",label:"Sales"},
                        ].map((t)=>(
                            <button
                                key={t.key}
                                onClick={()=>setTab(t.key as sellerTab)}
                                className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.5em] transition-all relative ${
                                    tab === t.key 
                                    ? "bg-[#121212] text-[#D4AF37]" 
                                    : "text-[#666] hover:text-[#A0A0A0]"
                                }`}
                            >
                                {tab === t.key && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37]"></div>
                                )}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-16">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                {tab === "menu" && <Items shopId={shop._id} />}
                                {tab === "add-item" && <AddItem onItemAdded={() => { fetchMyShop(); setTab("menu"); }} />}
                                {tab === "sales" && (
                                    <div className="py-32 flex flex-col items-center justify-center space-y-8 bg-[#0A0A0A] border border-[#1F1F1F] rounded-[0.25rem]">
                                        <div className="h-12 w-12 border border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
                                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.6em]">System Intelligence Decrypting</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;