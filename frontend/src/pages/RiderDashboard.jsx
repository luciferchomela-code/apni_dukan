import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import { riderService } from "../main";
import riderStateSound from "../../assets/son_duquotidient-message-envoye-iphone-apple-391098.mp3";
import RiderChat from "../components/RiderChat.jsx";
import {
    BiUpload, BiX, BiPhone, BiIdCard, BiCar,
    BiCurrentLocation, BiPowerOff, BiCheckCircle,
    BiTime, BiMapPin, BiPackage, BiRun, BiCheck,
    BiStore, BiUser, BiNavigation, BiRefresh,
    BiVolumeFull, BiVolumeMute
} from "react-icons/bi";

/* ─────────────── Status Config ─────────────── */
const STATUS_CONFIG = {
    rider_assigned: {
        label: "Assigned",
        color: "#D4AF37",
        bg: "from-[#D4AF37]/10 to-[#D4AF37]/5",
        border: "border-[#D4AF37]/20",
        actionLabel: "Pick Up Order",
        actionIcon: BiPackage,
        description: "Head to the shop to pick up the order",
    },
    picked_up: {
        label: "Picked Up",
        color: "#06B6D4",
        bg: "from-cyan-500/10 to-cyan-500/5",
        border: "border-cyan-500/20",
        actionLabel: "Mark Delivered",
        actionIcon: BiCheck,
        description: "Deliver the order to the customer",
    },
    delivered: {
        label: "Delivered",
        color: "#22C55E",
        bg: "from-emerald-500/10 to-emerald-500/5",
        border: "border-emerald-500/20",
        actionLabel: null,
        actionIcon: null,
        description: "Order has been delivered successfully",
    },
};

/* ─────────────── Registration Form ─────────────── */
const RiderRegistration = ({ onRegistered }) => {
    const [phone, setPhone] = useState("");
    const [aadhar, setAadhar] = useState("");
    const [license, setLicense] = useState("");
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) { setImage(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    const handleSubmit = async () => {
        if (!phone || !aadhar || !license || !image) { toast.error("All fields are required"); return; }
        if (!navigator.geolocation) { toast.error("Please enable location access"); return; }
        setSubmitting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const formData = new FormData();
                    formData.append("phoneNumber", phone);
                    formData.append("aadharNumber", aadhar);
                    formData.append("drivingLicenseNumber", license);
                    formData.append("latitude", String(position.coords.latitude));
                    formData.append("longitude", String(position.coords.longitude));
                    formData.append("file", image);
                    await axios.post(`${riderService}/api/add-profile`, formData, {
                        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` },
                    });
                    toast.success("Profile created successfully!");
                    onRegistered();
                } catch (err) { toast.error(err.response?.data?.message || "Registration failed"); }
                finally { setSubmitting(false); }
            },
            () => { toast.error("Location access denied"); setSubmitting(false); }
        );
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] shadow-lg shadow-[#D4AF37]/20 mx-auto">
                        <BiCar className="h-8 w-8 text-[#0A0A0A]" />
                    </div>
                    <h1 className="text-3xl font-black text-[#F8F8F8] tracking-tight">Become a Rider</h1>
                    <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-[0.3em]">Start delivering with Apni Dukan</p>
                </div>
                <div className="bg-[#121212] rounded-3xl border border-[#1F1F1F] p-8 space-y-6 shadow-2xl">
                    <div className="relative group">
                        {previewUrl ? (
                            <div className="relative h-44 w-44 mx-auto rounded-full overflow-hidden border-4 border-[#D4AF37]/30">
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setImage(null); setPreviewUrl(null); }} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all"><BiX className="h-6 w-6" /></button>
                                </div>
                            </div>
                        ) : (
                            <label className="w-44 h-44 mx-auto flex flex-col items-center justify-center rounded-full border-2 border-dashed border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#D4AF37]/40 cursor-pointer transition-all group">
                                <div className="bg-[#1A1A1A] p-3 rounded-full group-hover:bg-[#D4AF37]/10 transition-all"><BiUpload className="h-6 w-6 text-[#D4AF37]" /></div>
                                <span className="mt-2 text-[10px] font-bold text-[#666] group-hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Your Photo</span>
                                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    <div className="space-y-4">
                        {[
                            { icon: BiPhone, placeholder: "Phone Number", value: phone, onChange: setPhone, type: "tel" },
                            { icon: BiIdCard, placeholder: "Aadhar Number", value: aadhar, onChange: setAadhar },
                            { icon: BiCar, placeholder: "Driving License Number", value: license, onChange: setLicense },
                        ].map(({ icon: Icon, placeholder, value, onChange, type }, i) => (
                            <div key={i} className="relative">
                                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                                <input type={type || "text"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
                                    className="w-full rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] pl-11 pr-5 py-4 text-sm font-semibold text-[#F8F8F8] outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder:text-[#444] placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 bg-[#0A0A0A] p-4 rounded-xl border border-[#1F1F1F]">
                        <div className="bg-[#D4AF37]/10 p-2 rounded-lg"><BiCurrentLocation className="h-4 w-4 text-[#D4AF37]" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest">Location</p>
                            <p className="text-xs font-semibold text-[#A0A0A0]">Will be detected automatically</p>
                        </div>
                    </div>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8941F] py-4 text-sm font-black text-[#0A0A0A] hover:opacity-90 disabled:opacity-40 transition-all active:scale-[0.98] uppercase tracking-[0.2em] shadow-lg shadow-[#D4AF37]/10">
                        {submitting ? "Registering..." : "Register as Rider"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────── Order Card ─────────────── */
const ActiveOrderCard = ({ order, onAction, updating }) => {
    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.rider_assigned;
    const shopName = order.shopName || order.shopId?.name || "Shop";
    const addr = order.deliveryAddress;
    const addressStr = typeof addr === "string" ? addr : addr?.formattedAddress || "No address";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`bg-gradient-to-br ${config.bg} rounded-2xl border ${config.border} p-5 space-y-4 transition-all`}
        >
            {/* Status Badge & Order ID */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
                        <BiPackage className="h-5 w-5" style={{ color: config.color }} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#F8F8F8]">Order #{order._id?.slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] font-bold text-[#666] mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                </div>
                <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: `${config.color}15`, color: config.color, border: `1px solid ${config.color}30` }}>
                    {config.label}
                </span>
            </div>

            {/* Shop Info */}
            <div className="flex items-center gap-3 bg-[#0A0A0A]/60 rounded-xl p-3 border border-[#1F1F1F]">
                <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <BiStore className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest">Pick Up From</p>
                    <p className="text-sm font-bold text-[#E0E0E0] truncate">{shopName}</p>
                </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-3 bg-[#0A0A0A]/60 rounded-xl p-3 border border-[#1F1F1F]">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <BiNavigation className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest">Deliver To</p>
                    <p className="text-[12px] font-semibold text-[#A0A0A0] leading-relaxed mt-0.5">{addressStr}</p>
                    {addr?.mobile && (
                        <a href={`tel:${addr.mobile}`} className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-[#D4AF37] hover:underline">
                            <BiPhone className="h-3 w-3" /> {addr.mobile}
                        </a>
                    )}
                </div>
            </div>

            {/* Items Summary */}
            <div className="bg-[#0A0A0A]/60 rounded-xl p-3 border border-[#1F1F1F]">
                <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-2">Items</p>
                <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-[#A0A0A0] font-medium">{item.quantity}x {item.name}</span>
                            <span className="text-[#D4AF37] font-bold">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-[#1F1F1F] flex justify-between">
                        <span className="text-sm font-bold text-[#F8F8F8]">Total</span>
                        <span className="text-lg font-black text-[#D4AF37]">₹{order.totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="flex items-center gap-2 px-1">
                <BiRun className="h-4 w-4 shrink-0" style={{ color: config.color }} />
                <p className="text-[11px] font-semibold" style={{ color: config.color }}>{config.description}</p>
            </div>

            {/* Action Button */}
            {config.actionLabel && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAction(order._id)}
                    disabled={updating}
                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    style={{
                        background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}CC 100%)`,
                        color: "#0A0A0A",
                        boxShadow: `0 8px 24px ${config.color}30`,
                    }}
                >
                    {updating ? <BiRefresh className="h-5 w-5 animate-spin" /> : <config.actionIcon className="h-5 w-5" />}
                    {updating ? "Updating..." : config.actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
};

/* ─────────────── Delivered Order Card ─────────────── */
const DeliveredOrderCard = ({ order }) => (
    <div className="bg-[#121212] rounded-2xl border border-[#1F1F1F] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BiCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
                <p className="text-sm font-bold text-[#F8F8F8]">#{order._id?.slice(-6).toUpperCase()}</p>
                <p className="text-[10px] font-semibold text-[#555]">{order.shopName || "Shop"}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-black text-[#D4AF37]">₹{order.totalAmount}</p>
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Delivered</p>
        </div>
    </div>
);

/* ─────────────── Main Dashboard ─────────────── */
const RiderDashboard = () => {
    const { user } = useAppData();
    const { socket, socketReady } = useSocket();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [updatingOrder, setUpdatingOrder] = useState(false);
    const [activeTab, setActiveTab] = useState("active");
    const [riderAudio] = useState(() => new Audio(riderStateSound));
    const [soundEnabled, setSoundEnabled] = useState(true);
    const soundEnabledRef = useRef(soundEnabled);

    useEffect(() => {
        soundEnabledRef.current = soundEnabled;
    }, [soundEnabled]);

    const toggleSound = () => {
        if (!soundEnabled) {
            riderAudio.volume = 0;
            riderAudio.play().then(() => {
                riderAudio.pause();
                riderAudio.volume = 1;
                riderAudio.currentTime = 0;
            }).catch(e => console.log(e));
            setSoundEnabled(true);
            toast.success("Sound notifications enabled!");
        } else {
            setSoundEnabled(false);
            toast("Sound notifications disabled.", { icon: "🔇", style: { background: "#121212", color: "#F8F8F8" } });
        }
    };

    async function fetchProfile() {
        try {
            const { data } = await axios.get(riderService + "/api/myprofile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setProfile(data || null);
        } catch { setProfile(null); }
        finally { setLoading(false); }
    }

    async function fetchCurrentOrder() {
        try {
            const { data } = await axios.get(riderService + "/api/order/current", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (data?.order?.order) {
                const order = data.order.order;
                if (order.status === "delivered") {
                    setCurrentOrder(null);
                    setDeliveredOrders(prev => {
                        if (prev.find(o => o._id === order._id)) return prev;
                        return [order, ...prev];
                    });
                } else {
                    setCurrentOrder(order);
                }
            } else {
                setCurrentOrder(null);
            }
        } catch { setCurrentOrder(null); }
    }

    async function fetchPendingOrders() {
        try {
            const { data } = await axios.get(riderService + "/api/order/pending", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (data?.orders) {
                setPendingOrders(data.orders);
            }
        } catch (err) {
            console.error("Failed to fetch pending orders:", err);
        }
    }

    useEffect(() => {
        if (user?.role === "rider") { fetchProfile(); fetchCurrentOrder(); fetchPendingOrders(); }
        else setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!socket || !socketReady) return;

        const handleNewDelivery = (order) => {
            setPendingOrders(prev => {
                if (prev.find(o => o._id === order._id)) return prev;
                return [order, ...prev];
            });
            toast("🚀 New delivery request!", { style: { background: "#121212", color: "#D4AF37", border: "1px solid #1F1F1F" } });
            
            if (soundEnabledRef.current) {
                riderAudio.currentTime = 0;
                riderAudio.play().catch(e => console.warn("Rider audio error:", e));
            }
        };

        const handleOrderUpdate = (data) => {
            if (data.status === "delivered") {
                setCurrentOrder(null);
                fetchCurrentOrder();
            }
        };

        socket.on("new-delivery", handleNewDelivery);
        socket.on("order:picked_up", handleOrderUpdate);
        socket.on("order:delivered", handleOrderUpdate);

        return () => {
            socket.off("new-delivery", handleNewDelivery);
            socket.off("order:picked_up", handleOrderUpdate);
            socket.off("order:delivered", handleOrderUpdate);
        };
    }, [socket, socketReady]);

    useEffect(() => {
        if (!profile?.isAvailable) return;
        const interval = setInterval(() => {
            fetchPendingOrders();
        }, 15000); // every 15 seconds
        return () => clearInterval(interval);
    }, [profile?.isAvailable]);

    const toggleAvailability = async () => {
        // Unlock audio on interaction
        riderAudio.volume = 0;
        riderAudio.play().then(() => {
            riderAudio.pause();
            riderAudio.volume = 1;
            riderAudio.currentTime = 0;
        }).catch(e => console.log("Audio unlock failed, will try next interaction"));
        
        if (!navigator.geolocation) { toast.error("Please enable location"); return; }
        setToggling(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await axios.patch(riderService + "/api/toggle", {
                        isAvailable: !profile.isAvailable,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                    toast.success(profile.isAvailable ? "You are now offline" : "You are now available!");
                    await fetchProfile();
                    await fetchPendingOrders();
                } catch { toast.error("Something went wrong"); }
                finally { setToggling(false); }
            },
            () => { toast.error("Location access denied"); setToggling(false); }
        );
    };

    const acceptOrder = async (orderId) => {
        setUpdatingOrder(true);
        try {
            const { data } = await axios.post(`${riderService}/api/accept/${orderId}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (data.success) {
                toast.success("Order accepted!");
                setPendingOrders(prev => prev.filter(o => o._id !== orderId));
                await fetchCurrentOrder();
                await fetchProfile();
            } else {
                toast.error(data.message || "Could not accept order");
            }
        } catch (err) { toast.error(err.response?.data?.message || "Failed to accept order"); }
        finally { setUpdatingOrder(false); }
    };

    const updateOrderStatus = async (orderId) => {
        setUpdatingOrder(true);
        try {
            const { data } = await axios.put(`${riderService}/api/order/update/${orderId}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            toast.success(data.message || "Status updated!");
            await fetchCurrentOrder();
        } catch (err) { toast.error(err.response?.data?.message || "Failed to update"); }
        finally { setUpdatingOrder(false); }
    };

    if (user?.role !== "rider") return <Navigate to={"/"} replace />;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.3em]">Loading Dashboard</p>
                </div>
            </div>
        );
    }

    if (!profile) return <RiderRegistration onRegistered={fetchProfile} />;

    const isOnline = profile.isAvailable;
    const allActiveOrders = currentOrder ? [currentOrder] : [];
    const allPending = pendingOrders.filter(o => !currentOrder || o._id !== currentOrder._id);

    return (
        <div className="min-h-screen bg-[#0A0A0A] px-4 py-6 pb-24">
            <div className="mx-auto max-w-2xl space-y-6">

                {/* Status Header */}
                <div className="relative text-center space-y-2 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 bg-[#121212] border border-[#1F1F1F] rounded-full px-4 py-2">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-[#666]"}`} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isOnline ? "text-emerald-400" : "text-[#666]"}`}>
                                {isOnline ? "Online" : "Offline"}
                            </span>
                        </div>
                        <button 
                            onClick={toggleSound}
                            className={`p-2.5 rounded-full border transition-all duration-300 ${soundEnabled ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]" : "bg-[#121212] border-[#1F1F1F] text-[#666] hover:bg-[#1A1A1A] hover:text-[#999]"}`}
                        >
                            {soundEnabled ? <BiVolumeFull size={18} /> : <BiVolumeMute size={18} />}
                        </button>
                    </div>
                    <h1 className="text-2xl font-black text-[#F8F8F8] tracking-tight">Rider Dashboard</h1>
                </div>

                {/* Profile Card */}
                <div className="bg-[#121212] rounded-2xl border border-[#1F1F1F] p-6 shadow-xl">
                    <div className="flex items-center gap-5">
                        {profile.picture ? (
                            <img src={profile.picture} alt="Rider" className="h-16 w-16 rounded-full object-cover border-2 border-[#D4AF37]/30" />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center text-xl font-black text-[#0A0A0A]">
                                {user?.name?.charAt(0).toUpperCase() || "R"}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-[#F8F8F8] truncate">{user?.name || "Rider"}</h2>
                            <p className="text-xs text-[#666] font-semibold truncate">{user?.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                                {profile.isVerified ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        <BiCheckCircle className="h-3 w-3" /> Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        <BiTime className="h-3 w-3" /> Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Availability Toggle */}
                <div className={`relative rounded-2xl border p-6 transition-all duration-500 ${isOnline ? "bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20" : "bg-[#121212] border-[#1F1F1F]"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-black text-[#F8F8F8]">{isOnline ? "Accepting Deliveries" : "Go Online"}</h3>
                            <p className="text-xs text-[#666] font-semibold mt-1">{isOnline ? "You're visible to nearby shops" : "Toggle to start receiving orders"}</p>
                        </div>
                        <button onClick={toggleAvailability} disabled={toggling}
                            className={`relative w-20 h-10 rounded-full transition-all duration-300 ${isOnline ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-[#2A2A2A]"} ${toggling ? "opacity-50" : ""}`}>
                            <span className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${isOnline ? "left-11" : "left-1"}`}>
                                <BiPowerOff className={`h-4 w-4 ${isOnline ? "text-emerald-500" : "text-[#666]"}`} />
                            </span>
                        </button>
                    </div>
                    {isOnline && profile.location?.coordinates && (
                        <div className="flex items-center gap-2 mt-4 bg-emerald-500/10 rounded-lg px-3 py-2">
                            <BiMapPin className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Location Active — GPS Tracking Enabled</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#121212] rounded-2xl border border-[#1F1F1F] p-4 text-center">
                        <p className="text-2xl font-black text-[#D4AF37]">{allActiveOrders.length + allPending.length}</p>
                        <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest mt-1">Active</p>
                    </div>
                    <div className="bg-[#121212] rounded-2xl border border-[#1F1F1F] p-4 text-center">
                        <p className="text-2xl font-black text-[#F8F8F8]">{deliveredOrders.length}</p>
                        <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest mt-1">Delivered</p>
                    </div>
                    <div className="bg-[#121212] rounded-2xl border border-[#1F1F1F] p-4 text-center">
                        <p className="text-2xl font-black text-emerald-400">₹{deliveredOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0)}</p>
                        <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest mt-1">Earnings</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#121212] rounded-xl p-1 border border-[#1F1F1F]">
                    {["active", "pending", "delivered"].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab ? "bg-[#D4AF37] text-[#0A0A0A]" : "text-[#666] hover:text-[#999]"}`}>
                            {tab}
                            <span className={`ml-1.5 ${activeTab === tab ? "text-[#0A0A0A]/60" : "text-[#444]"}`}>
                                {tab === "active" ? allActiveOrders.length : tab === "pending" ? allPending.length : deliveredOrders.length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Orders Section */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {activeTab === "active" && (
                            <motion.div key="active" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                {allActiveOrders.length === 0 ? (
                                    <EmptyState icon={BiCar} title="No active delivery" subtitle={isOnline ? "Waiting for orders..." : "Go online to start"} />
                                ) : (
                                    allActiveOrders.map(order => (
                                        <ActiveOrderCard key={order._id} order={order} onAction={updateOrderStatus} updating={updatingOrder} />
                                    ))
                                )}
                            </motion.div>
                        )}

                        {activeTab === "pending" && (
                            <motion.div key="pending" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <div className="flex justify-end">
                                    <button onClick={fetchPendingOrders} className="text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg px-3 py-1.5 hover:bg-[#D4AF37]/10 flex items-center gap-1 transition-all">
                                        <BiRefresh className="h-4 w-4" /> Refresh
                                    </button>
                                </div>
                                {allPending.length === 0 ? (
                                    <EmptyState icon={BiPackage} title="No pending requests" subtitle="New delivery requests will appear here" />
                                ) : (
                                    allPending.map(order => (
                                        <motion.div key={order._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                            className="bg-[#121212] rounded-2xl border border-[#D4AF37]/20 p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                                                        <BiPackage className="h-5 w-5 text-[#D4AF37]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#F8F8F8]">#{order._id?.slice(-6).toUpperCase()}</p>
                                                        <p className="text-[10px] text-[#666] font-semibold">{order.items?.length || 0} items</p>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-black text-[#D4AF37]">₹{order.totalAmount || "—"}</span>
                                            </div>
                                            {order.deliveryAddress && (
                                                <div className="flex items-start gap-2 bg-[#0A0A0A] rounded-lg p-3 border border-[#1F1F1F]">
                                                    <BiMapPin className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 shrink-0" />
                                                    <p className="text-[10px] text-[#888] font-semibold leading-relaxed">
                                                        {typeof order.deliveryAddress === "string" ? order.deliveryAddress : order.deliveryAddress?.formattedAddress}
                                                    </p>
                                                </div>
                                            )}
                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                onClick={() => acceptOrder(order._id)} disabled={updatingOrder}
                                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-sm font-black text-[#0A0A0A] uppercase tracking-[0.15em] disabled:opacity-50 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2">
                                                {updatingOrder ? <BiRefresh className="h-5 w-5 animate-spin" /> : <BiCheck className="h-5 w-5" />}
                                                {updatingOrder ? "Accepting..." : "Accept Order"}
                                            </motion.button>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {activeTab === "delivered" && (
                            <motion.div key="delivered" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                                {deliveredOrders.length === 0 ? (
                                    <EmptyState icon={BiCheck} title="No deliveries yet" subtitle="Completed deliveries will appear here" />
                                ) : (
                                    deliveredOrders.map(order => <DeliveredOrderCard key={order._id} order={order} />)
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Last Active */}
                {profile.lastActiveAt && (
                    <div className="text-center py-4">
                        <p className="text-[10px] font-bold text-[#333] uppercase tracking-widest">
                            Last active: {new Date(profile.lastActiveAt).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Chat Component */}
            {currentOrder && (
                <RiderChat order={currentOrder} riderName={user?.name || "Rider"} />
            )}
        </div>
    );
};

/* ─────────────── Empty State ─────────────── */
const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div className="bg-[#121212] rounded-2xl border border-[#1F1F1F] p-10 text-center">
        <div className="bg-[#1A1A1A] w-14 h-14 rounded-full flex items-center justify-center mx-auto">
            <Icon className="h-6 w-6 text-[#333]" />
        </div>
        <p className="text-sm font-bold text-[#444] mt-4">{title}</p>
        <p className="text-[10px] text-[#333] font-semibold mt-1">{subtitle}</p>
    </div>
);

export default RiderDashboard;
