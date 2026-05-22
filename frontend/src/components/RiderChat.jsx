import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    BiSend, BiX, BiMessageRoundedDots, BiStore, BiUser,
    BiChevronDown, BiTime
} from "react-icons/bi";

const RiderChat = ({ order, riderName }) => {
    const { socket, socketReady } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState("shop");
    const [message, setMessage] = useState("");
    const [shopMessages, setShopMessages] = useState([]);
    const [userMessages, setUserMessages] = useState([]);
    const [unreadShop, setUnreadShop] = useState(0);
    const [unreadUser, setUnreadUser] = useState(0);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [shopMessages, userMessages, isOpen]);

    useEffect(() => {
        if (!socket || !socketReady || !order) return;

        const handleShopMsg = (data) => {
            setShopMessages(prev => [...prev, { ...data, fromSelf: false }]);
            if (activeChat !== "shop" || !isOpen) setUnreadShop(p => p + 1);
        };
        const handleUserMsg = (data) => {
            setUserMessages(prev => [...prev, { ...data, fromSelf: false }]);
            if (activeChat !== "user" || !isOpen) setUnreadUser(p => p + 1);
        };

        socket.on("chat:from_shop", handleShopMsg);
        socket.on("chat:from_user", handleUserMsg);

        return () => {
            socket.off("chat:from_shop", handleShopMsg);
            socket.off("chat:from_user", handleUserMsg);
        };
    }, [socket, socketReady, order, activeChat, isOpen]);

    useEffect(() => {
        if (isOpen && activeChat === "shop") setUnreadShop(0);
        if (isOpen && activeChat === "user") setUnreadUser(0);
    }, [isOpen, activeChat]);

    const sendMessage = () => {
        if (!message.trim() || !socket || !order) return;
        const msgData = {
            orderId: order._id,
            text: message.trim(),
            senderName: riderName || "Rider",
            senderRole: "rider",
            timestamp: new Date().toISOString(),
        };

        if (activeChat === "shop") {
            socket.emit("chat:rider_to_shop", {
                ...msgData,
                room: `shop:${order.shopId?._id || order.shopId}`,
            });
            setShopMessages(prev => [...prev, { ...msgData, fromSelf: true }]);
        } else {
            socket.emit("chat:rider_to_user", {
                ...msgData,
                room: `user:${order.userId}`,
            });
            setUserMessages(prev => [...prev, { ...msgData, fromSelf: true }]);
        }
        setMessage("");
    };

    const currentMessages = activeChat === "shop" ? shopMessages : userMessages;
    const totalUnread = unreadShop + unreadUser;

    if (!order) return null;

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen ? "hidden" : ""}`}
                style={{
                    background: "linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)",
                    boxShadow: "0 8px 32px rgba(212,175,55,0.4)",
                }}
            >
                <BiMessageRoundedDots className="h-7 w-7 text-[#0A0A0A]" />
                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                        {totalUnread}
                    </span>
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl overflow-hidden shadow-2xl border border-[#1F1F1F]"
                        style={{ height: "520px", background: "#0A0A0A" }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] px-5 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-[#0A0A0A] uppercase tracking-[0.15em]">
                                    Order Chat
                                </h3>
                                <p className="text-[10px] font-bold text-[#0A0A0A]/60 mt-0.5">
                                    #{order._id?.slice(-6).toUpperCase()}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-[#0A0A0A]/20 flex items-center justify-center hover:bg-[#0A0A0A]/40 transition-all"
                            >
                                <BiX className="h-5 w-5 text-[#0A0A0A]" />
                            </button>
                        </div>

                        {/* Chat Tabs */}
                        <div className="flex bg-[#121212] border-b border-[#1F1F1F]">
                            {[
                                { key: "shop", label: "Shop", icon: BiStore, unread: unreadShop },
                                { key: "user", label: "Customer", icon: BiUser, unread: unreadUser },
                            ].map(({ key, label, icon: Icon, unread }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveChat(key)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                                        activeChat === key
                                            ? "text-[#D4AF37] bg-[#D4AF37]/5"
                                            : "text-[#666] hover:text-[#999]"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                    {unread > 0 && (
                                        <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center">
                                            {unread}
                                        </span>
                                    )}
                                    {activeChat === key && (
                                        <motion.div
                                            layoutId="chatTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: "330px" }}>
                            {currentMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                                        <BiMessageRoundedDots className="h-7 w-7 text-[#333]" />
                                    </div>
                                    <p className="text-xs font-bold text-[#444]">
                                        No messages yet
                                    </p>
                                    <p className="text-[10px] text-[#333] mt-1">
                                        Send a message to the {activeChat === "shop" ? "shop" : "customer"}
                                    </p>
                                </div>
                            ) : (
                                currentMessages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.fromSelf ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                                msg.fromSelf
                                                    ? "bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-[#0A0A0A]"
                                                    : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#E0E0E0]"
                                            }`}
                                        >
                                            {!msg.fromSelf && (
                                                <p className="text-[9px] font-black uppercase tracking-wider mb-1 opacity-60">
                                                    {msg.senderName}
                                                </p>
                                            )}
                                            <p className="text-[13px] font-semibold leading-relaxed">
                                                {msg.text}
                                            </p>
                                            <p className={`text-[9px] mt-1 flex items-center gap-1 ${msg.fromSelf ? "text-[#0A0A0A]/50" : "text-[#555]"}`}>
                                                <BiTime className="h-3 w-3" />
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-[#1F1F1F] bg-[#121212] p-3 flex items-center gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-[#F8F8F8] placeholder:text-[#444] outline-none focus:border-[#D4AF37]/40 transition-all"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!message.trim()}
                                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                                style={{
                                    background: message.trim()
                                        ? "linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)"
                                        : "#1A1A1A",
                                }}
                            >
                                <BiSend className={`h-5 w-5 ${message.trim() ? "text-[#0A0A0A]" : "text-[#555]"}`} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RiderChat;
