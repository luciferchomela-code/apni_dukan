import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.jsx";
import axios from "axios";
import { shopService } from "../main";
import notificationSound from "../../assets/universfield-happy-message-ping-351298.mp3";
import { motion } from "framer-motion";
import { 
  BiPackage, BiMap, BiStore, BiMoney, BiTimeFive, 
  BiCheckCircle, BiUser, BiPhoneCall, BiArrowBack 
} from "react-icons/bi";

const STATUS_STEPS = ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up", "delivered"];
const STATUS_LABELS = {
  placed: "Order Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready_for_rider: "Ready",
  rider_assigned: "Rider Assigned",
  picked_up: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const OrdersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audio] = useState(() => new Audio(notificationSound));

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${shopService}/api/order/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrder(data.order || data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const joinShopRoom = (shopId) => {
      if (shopId) {
        socket.emit("join_shop", shopId);
      }
    };

    const onOrderUpdate = async () => {
      audio.currentTime = 0;
      audio.play().catch((e) => console.warn("Audio play error:", e));
      await fetchOrder();
    };

    socket.on("order_update", onOrderUpdate);
    socket.on("order:new", onOrderUpdate);

    if (order?.shopId) joinShopRoom(order.shopId);

    return () => {
      socket.off("order_update", onOrderUpdate);
      socket.off("order:new", onOrderUpdate);
    };
  }, [socket, order?.shopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BiPackage size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error || "The order you're looking for doesn't exist or you don't have access."}</p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors mb-4"
        >
          <BiArrowBack size={20} />
          Back to Orders
        </button>

        {/* Top Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Order <span className="text-blue-600 dark:text-blue-400">#{order._id.slice(-8).toUpperCase()}</span>
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCancelled 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                    : order.status === 'delivered'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                <BiTimeFive size={18} />
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BiStore size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sold by</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{order.shopName}</p>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          {!isCancelled && (
            <div className="mt-12 mb-4 relative px-2 sm:px-6">
              <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const hiddenOnMobile = ["accepted", "ready_for_rider", "rider_assigned", "picked_up"].includes(step);
                  
                  return (
                    <div key={step} className={`flex flex-col items-center ${hiddenOnMobile ? 'hidden sm:flex' : 'flex'}`}>
                      <div className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500
                        ${isCompleted ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40' : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-400'}
                        ${isCurrent ? 'ring-4 ring-blue-500/20 scale-110' : ''}
                      `}>
                        {isCompleted ? <BiCheckCircle size={20} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />}
                      </div>
                      <span className={`
                        mt-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider absolute top-10 whitespace-nowrap transition-colors duration-300
                        ${isCurrent ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}
                      `}>
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {isCancelled && (
             <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
               <p className="text-red-700 dark:text-red-400 text-center font-semibold">This order has been cancelled.</p>
             </div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Items Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BiPackage className="text-blue-500" />
                Order Items
              </h3>
              
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center font-bold text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700">
                        x{item.quantity}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">₹{item.price} each</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pricing Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BiMoney className="text-green-500" />
                Payment Summary
              </h3>
              
              <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <div className="flex justify-between text-gray-600 dark:text-gray-300 font-medium">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300 font-medium">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300 font-medium">
                  <span>Platform Fee</span>
                  <span>₹{order.platformFee}</span>
                </div>
                
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">Payment Status</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Delivery Address */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BiMap className="text-red-500" />
                Delivery Details
              </h3>
              <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed mb-3">
                  {order.deliveryAddress?.formattedAddress}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/50 w-fit px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                  <BiPhoneCall size={16} />
                  <span className="font-medium">{order.deliveryAddress?.mobile}</span>
                </div>
              </div>
            </motion.div>

            {/* Rider Info (if assigned) */}
            {(order.riderName || currentStepIndex >= 4) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/60"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BiUser className="text-indigo-500" />
                  Delivery Partner
                </h3>
                {order.riderName ? (
                  <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 dark:border-gray-700">
                      <BiUser size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{order.riderName}</p>
                      {order.riderPhone && (
                        <a href={`tel:${order.riderPhone}`} className="text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center gap-1 mt-0.5 hover:underline">
                          <BiPhoneCall size={14} /> Call Rider
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 border-dashed">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <BiUser className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Assigning a delivery partner soon...</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Need Help */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-600 text-white rounded-3xl p-6 shadow-lg shadow-blue-600/20 relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-4">Having issues with your order or want to cancel?</p>
              <button className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm">
                Contact Support
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
