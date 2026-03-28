import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { shopService } from "../main";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BiMapPin, BiStore, BiCommand, BiCrown } from "react-icons/bi";

interface Shop {
  _id: string;
  name: string;
  description: string;
  image: string;
  isOpen: boolean;
  distanceKm?: number;
  autoLocation: {
    formattedAddress: string;
  };
}

const Home = () => {
    const { location, user, loading: appLoading } = useAppData();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const search = searchParams.get("search") || "";

    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchShops = async () => {
        if (!location?.latitude || !location?.longitude) return;
        
        try {
            setLoading(true);
            const response = await axios.get(`${shopService}/api/shop/all`, {
                params: { 
                    latitude: location.latitude, 
                    longitude: location.longitude,
                    search 
                },
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            setShops(response.data.shop);
        } catch (error) {
            console.error("Shop fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!appLoading && user?.role === "seller") {
            navigate("/shop");
        }
    }, [user, appLoading, navigate]);

    useEffect(() => {
        fetchShops();
    }, [location, search]);

    if (appLoading || (loading && !shops.length)) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-8">
                <div className="h-12 w-12 border border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
                <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.6em]">Loading Marketplace...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#A0A0A0] pb-20">
            {/* Luxe Hero Header */}
            <div className="relative h-[40vh] bg-[#0A0A0A] border-b border-[#1F1F1F] overflow-hidden flex flex-col items-center justify-center px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center space-y-4"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-[1px] w-8 bg-[#D4AF37]/30"></div>
                        <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em]">Shops Near You</span>
                        <div className="h-[1px] w-8 bg-[#D4AF37]/30"></div>
                    </div>
                    <h1 className="text-5xl font-serif text-[#F8F8F8] italic tracking-widest uppercase">The Shops</h1>
                    <div className="flex items-center justify-center gap-3 text-xs tracking-wider opacity-60">
                        <BiMapPin className="text-[#D4AF37]" />
                        <span>Showing shops closest to your location</span>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
                {shops.length === 0 ? (
                    <div className="py-40 flex flex-col items-center justify-center space-y-8 bg-[#121212] border border-[#1F1F1F] rounded-[0.5rem] shadow-2xl">
                        <div className="p-10 rounded-full border border-[#D4AF37]/10 bg-[#0A0A0A]">
                            <BiStore className="h-12 w-12 text-[#D4AF37]/20" />
                        </div>
                        <div className="text-center space-y-3">
                           <h3 className="text-2xl font-serif text-[#F8F8F8] tracking-widest uppercase italic">No Matches Found</h3>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Adjust your search parameters or location</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {shops.map((shop, index) => (
                                <motion.div 
                                    key={shop._id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/shop/${shop._id}`)}
                                    className="group cursor-pointer bg-[#121212] border border-[#1F1F1F] rounded-[0.25rem] overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-1000 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                                >
                                    <div className="relative h-64 overflow-hidden bg-[#0A0A0A]">
                                        <img 
                                            src={shop.image} 
                                            alt={shop.name} 
                                            className="h-full w-full object-cover mix-blend-lighten transition-all duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
                                        
                                        {!shop.isOpen && (
                                            <div className="absolute inset-0 bg-[#0A0A0A]/80 flex items-center justify-center backdrop-blur-[2px]">
                                                <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.5em] border border-red-500/20 px-8 py-4">Restricted Access</span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
                                             <div className="flex items-center gap-2 bg-[#0A0A0A]/60 px-4 py-1.5 rounded-full border border-[#D4AF37]/5 backdrop-blur-sm">
                                                <BiCrown className="h-3 w-3 text-[#D4AF37]" />
                                                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Featured Shop</span>
                                             </div>
                                             {shop.distanceKm !== undefined && (
                                                 <span className="text-[9px] font-black text-[#A0A0A0] uppercase tracking-[0.2em]">{shop.distanceKm} km away</span>
                                             )}
                                        </div>
                                    </div>

                                    <div className="p-10 space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-serif text-[#F8F8F8] italic tracking-widest uppercase group-hover:text-[#D4AF37] transition-colors">{shop.name}</h3>
                                            <div className="h-[1px] w-8 bg-[#D4AF37]/40"></div>
                                        </div>

                                        <p className="text-[11px] text-[#A0A0A0] leading-relaxed tracking-wider line-clamp-2 min-h-[2.5rem] italic opacity-80">
                                            "{shop.description || 'A great place to shop for high quality items and products near you.'}"
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-[#1F1F1F]">
                                            <div className="flex items-center gap-3">
                                                <BiMapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                                                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{shop.autoLocation.formattedAddress}</span>
                                            </div>
                                            <div className="bg-[#D4AF37]/10 h-10 w-10 rounded-full flex items-center justify-center border border-[#D4AF37]/20 group-hover:bg-[#D4AF37] transition-all duration-500">
                                                <BiCommand className="text-[#D4AF37] h-4 w-4 group-hover:text-[#0A0A0A] transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;