import { useEffect, useState, useRef } from "react";
import notificationSound from "../../assets/universfield-happy-message-ping-351298.mp3";
import { useSocket } from "../context/SocketContext.jsx";
import { shopService } from "../main";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    BiPackage,
    BiCheck,
    BiTime,
    BiBell,
    BiMap,
    BiPhone,
    BiChevronDown,
    BiChevronUp,
    BiRefresh,
    BiVolumeFull,
    BiVolumeMute,
} from "react-icons/bi";

const ACTIVE_STATUS = [
    "placed",
    "accepted",
    "preparing",
    "ready_for_rider",
    "rider_assigned",
    "picked_up",
];

const STATUS_FLOW = {
    placed: { label: "Placed", next: "accepted", nextLabel: "Accept Order", color: "#F59E0B" },
    accepted: { label: "Accepted", next: "preparing", nextLabel: "Start Preparing", color: "#3B82F6" },
    preparing: { label: "Preparing", next: "ready_for_rider", nextLabel: "Ready for Pickup", color: "#8B5CF6" },
    ready_for_rider: { label: "Ready for Rider", next: null, nextLabel: null, color: "#10B981" },
    rider_assigned: { label: "Rider Assigned", next: null, nextLabel: null, color: "#06B6D4" },
    picked_up: { label: "Picked Up", next: null, nextLabel: null, color: "#6366F1" },
    delivered: { label: "Delivered", next: null, nextLabel: null, color: "#22C55E" },
    cancelled: { label: "Cancelled", next: null, nextLabel: null, color: "#EF4444" },
};

const STATUS_STEPS = ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up", "delivered"];

const ShopOrders = ({ shopId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [activeTab, setActiveTab] = useState("active");
    const [refreshing, setRefreshing] = useState(false);

    const { socket, socketReady } = useSocket();
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(notificationSound);
        audioRef.current.load();
    }, []);

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => console.log("Audio play error:", err));
        }
    };

    const unlockAudio = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => {
                setAudioUnlocked(true);
                toast.success("Notifications enabled!");
            }).catch((err) => {
                console.error("Audio unlock error:", err);
                toast.error("Could not enable audio. Please interact with the page first.");
            });
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${shopService}/api/order/order/${shopId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            setUpdatingOrder(orderId);
            await axios.put(
                `${shopService}/api/order/${orderId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success(`Order updated to ${STATUS_FLOW[newStatus]?.label || newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update order");
        } finally {
            setUpdatingOrder(null);
        }
    };

    useEffect(() => {
        if (shopId) fetchOrders();
    }, [shopId]);

    useEffect(() => {
        if (!socket || !socketReady || !shopId) return;
        
        socket.emit("join_shop", shopId);

        const onRefresh = () => {
            fetchOrders();
        };

        socket.on("order:new", onRefresh);
        socket.on("rider_assigned", onRefresh);
        socket.on("order:picked_up", onRefresh);
        socket.on("order:delivered", onRefresh);

        return () => {
            socket.off("order:new", onRefresh);
            socket.off("rider_assigned", onRefresh);
            socket.off("order:picked_up", onRefresh);
            socket.off("order:delivered", onRefresh);
        };
    }, [socket, socketReady, shopId]);

    const activeOrders = orders.filter((order) => ACTIVE_STATUS.includes(order.status));
    const completedOrders = orders.filter((order) => !ACTIVE_STATUS.includes(order.status));
    const displayOrders = activeTab === "active" ? activeOrders : completedOrders;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Order Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your shop's orders</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {!audioUnlocked && (
                            <button
                                onClick={unlockAudio}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium text-sm border border-blue-100 dark:border-blue-800"
                            >
                                <BiVolumeMute size={18} />
                                Enable Alerts
                            </button>
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-sm border border-gray-200 dark:border-gray-600 shadow-sm ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <BiRefresh size={18} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl w-fit backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 relative ${activeTab === "active" ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Active Orders
                        <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs ${activeTab === "active" ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {activeOrders.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 relative ${activeTab === "completed" ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Completed
                        <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs ${activeTab === "completed" ? 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {completedOrders.length}
                        </span>
                    </button>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : displayOrders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
                        >
                            <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-5 shadow-inner">
                                <BiPackage size={56} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">No orders found</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">There are no {activeTab} orders at the moment.</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {displayOrders.map((order) => (
                                <OrderCard 
                                    key={order._id} 
                                    order={order}
                                    isExpanded={expandedOrder === order._id}
                                    onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                    onUpdateStatus={updateStatus}
                                    updating={updatingOrder === order._id}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

const formatAddress = (addr) => {
    if (!addr) return "No address provided";
    if (typeof addr === 'string') return addr;
    if (addr.street || addr.city) {
        return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',');
    }
    return JSON.stringify(addr);
};

const OrderCard = ({ order, isExpanded, onToggle, onUpdateStatus, updating }) => {
    const statusInfo = STATUS_FLOW[order.status] || { label: order.status, color: "#6B7280", next: null };
    
    const calculateTotal = () => {
        if (order.totalAmount) return order.totalAmount;
        return order.items?.reduce((acc, curr) => acc + ((curr.item?.price || 0) * (curr.quantity || 1)), 0) || 0;
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
        >
            {/* Header / Summary */}
            <div 
                className="p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden"
                onClick={onToggle}
            >
                <div 
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: statusInfo.color }}
                />
                <div className="flex items-center gap-5 flex-1 pl-2">
                    <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color }}
                    >
                        <BiPackage size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                                Order #{order._id.slice(-6).toUpperCase()}
                            </h3>
                            <span 
                                className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm"
                                style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color, border: `1px solid ${statusInfo.color}30` }}
                            >
                                {statusInfo.label}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                <BiTime size={16} /> 
                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                {order.items?.length || 0} items
                            </span>
                            <span className="font-bold text-gray-800 dark:text-gray-200 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-md border border-green-100 dark:border-green-900/50">
                                ₹{calculateTotal()}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Action button if status has a next state */}
                    {statusInfo.next && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(order._id, statusInfo.next);
                            }}
                            disabled={updating}
                            className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg flex items-center gap-2 ${updating ? 'opacity-70 cursor-wait' : 'hover:brightness-110'}`}
                            style={{ backgroundColor: statusInfo.color }}
                        >
                            {updating ? <BiRefresh className="animate-spin" size={20} /> : <BiCheck size={20} />}
                            {statusInfo.nextLabel}
                        </button>
                    )}
                    <button className={`p-2.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isExpanded ? 'rotate-180 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : ''}`}>
                        <BiChevronDown size={24} />
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm"
                    >
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Items List */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <BiPackage size={20} />
                                    </div>
                                    Order Summary
                                </h4>
                                <div className="space-y-3 bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 last:pb-0 first:pt-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 shadow-inner">
                                                    x{item.quantity}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                                                        {item.item?.name || "Unknown Item"}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        ₹{item.item?.price || 0} each
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                                ₹{(item.item?.price || 0) * (item.quantity || 1)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-2 border-t-2 border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center text-lg font-bold">
                                        <span className="text-gray-900 dark:text-white">Total Amount</span>
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-2xl">
                                            ₹{calculateTotal()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <BiMap size={20} />
                                    </div>
                                    Delivery Info
                                </h4>
                                <div className="bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm space-y-5">
                                    {order.user ? (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xl shadow-sm border border-blue-200 dark:border-blue-800">
                                                    {order.user.name?.charAt(0).toUpperCase() || "C"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{order.user.name || "Guest User"}</p>
                                                    <a href={`tel:${order.user.phone}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-0.5 w-fit">
                                                        <BiPhone size={16} /> {order.user.phone || "No phone provided"}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-start gap-3">
                                                    <BiMap className="text-gray-400 mt-1 shrink-0" size={18} />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Delivery Address</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {formatAddress(order.deliveryAddress || order.address)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full py-8 text-gray-500 italic">
                                            Customer details not available
                                        </div>
                                    )}
                                    
                                    {/* Rider Info if assigned */}
                                    {order.riderId && (
                                        <div className="space-y-4 mt-6">
                                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                                    <BiCheck size={20} />
                                                </div>
                                                Rider Information
                                            </h4>
                                            <div className="bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={order.riderName || "https://ui-avatars.com/api/?name=Rider"} 
                                                        alt="Rider"
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-green-500/50"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                                                            {order.riderName ? "Your Rider" : "Rider Assigned"}
                                                        </p>
                                                        {order.riderPhone && (
                                                            <a href={`tel:${order.riderPhone}`} className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline flex items-center gap-1.5 mt-0.5">
                                                                <BiPhone size={16} /> {order.riderPhone}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Timeline / Progress Bar */}
                                <div className="mt-8 bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Status Tracking</h5>
                                    <div className="flex justify-between items-center relative px-2">
                                        <div className="absolute top-1/2 left-2 right-2 h-1 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            {/* Progress Fill */}
                                            {(() => {
                                                const currentIndex = STATUS_STEPS.indexOf(order.status);
                                                const progressPercentage = Math.max(0, (currentIndex / (STATUS_STEPS.length - 1)) * 100);
                                                return (
                                                    <div 
                                                        className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                                                        style={{ width: `${progressPercentage}%` }} 
                                                    />
                                                );
                                            })()}
                                        </div>
                                        
                                        {STATUS_STEPS.map((step, idx) => {
                                            const stepIndex = STATUS_STEPS.indexOf(order.status);
                                            const isCompleted = idx <= stepIndex;
                                            const isCurrent = idx === stepIndex;
                                            const stepInfo = STATUS_FLOW[step];
                                            
                                            // Only show a few key nodes for a cleaner look
                                            if (!["placed", "preparing", "picked_up", "delivered"].includes(step) && !isCurrent) {
                                                return null;
                                            }
                                            
                                            return (
                                                <div key={step} className="relative z-10 flex flex-col items-center group">
                                                    <div 
                                                        className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${isCompleted ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'} ${isCurrent ? 'ring-4 ring-blue-500/30 scale-125' : ''}`} 
                                                    />
                                                    <div className={`absolute top-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 md:opacity-100'}`}>
                                                        {stepInfo?.label || step}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-8 text-center md:hidden">
                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            {STATUS_FLOW[order.status]?.label || order.status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ShopOrders;