import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { shopService } from "../main";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiPackage, BiTime, BiStore, BiChevronRight,
  BiRefresh, BiReceipt, BiCheckCircle
} from "react-icons/bi";

const STATUS_CONFIG = {
  placed: { label: "Placed", color: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-900/20" },
  accepted: { label: "Accepted", color: "#3B82F6", bg: "bg-blue-50 dark:bg-blue-900/20" },
  preparing: { label: "Preparing", color: "#8B5CF6", bg: "bg-violet-50 dark:bg-violet-900/20" },
  ready_for_rider: { label: "Ready", color: "#10B981", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  rider_assigned: { label: "Rider Assigned", color: "#06B6D4", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  picked_up: { label: "Picked Up", color: "#6366F1", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  delivered: { label: "Delivered", color: "#22C55E", bg: "bg-green-50 dark:bg-green-900/20" },
  cancelled: { label: "Cancelled", color: "#EF4444", bg: "bg-red-50 dark:bg-red-900/20" },
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${shopService}/api/order/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const activeOrders = orders.filter(o =>
    !["delivered", "cancelled"].includes(o.status)
  );
  const pastOrders = orders.filter(o =>
    ["delivered", "cancelled"].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <BiReceipt size={28} />
              </div>
              My Orders
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Track and manage your orders
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${refreshing ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <BiRefresh size={22} className={`text-gray-600 dark:text-gray-300 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-6 shadow-inner">
              <BiPackage size={56} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start shopping to see your orders here!</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Browse Shops
            </button>
          </motion.div>
        ) : (
          <>
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Active Orders ({activeOrders.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {activeOrders.map((order) => (
                      <OrderItem key={order._id} order={order} navigate={navigate} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 mt-8">
                  Past Orders ({pastOrders.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {pastOrders.map((order) => (
                      <OrderItem key={order._id} order={order} navigate={navigate} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const OrderItem = ({ order, navigate }) => {
  const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, color: "#6B7280", bg: "bg-gray-50" };
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  const itemCount = order.items?.length || 0;
  const itemNames = order.items?.map(i => i.name).slice(0, 2).join(", ") || "No items";
  const extraItems = itemCount > 2 ? ` +${itemCount - 2} more` : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => navigate(`/orders/${order._id}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/60 cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color }}
        >
          {isDelivered ? <BiCheckCircle size={28} /> : <BiPackage size={28} />}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
              Order #{order._id.slice(-6).toUpperCase()}
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: `${statusInfo.color}15`,
                color: statusInfo.color,
                border: `1px solid ${statusInfo.color}30`,
              }}
            >
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <BiStore size={14} className="shrink-0" />
            <span className="truncate font-medium">{order.shopName}</span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {itemNames}{extraItems}
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <BiTime size={14} />
                {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <BiChevronRight size={22} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0" />
      </div>
    </motion.div>
  );
};

export default MyOrders;
