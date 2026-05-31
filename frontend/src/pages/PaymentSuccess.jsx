import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BiCheckShield, BiShoppingBag, BiReceipt, BiLoader } from "react-icons/bi";
import axios from "axios";
import toast from "react-hot-toast";
import { utilsService } from "../main";

const PaymentSuccess = () => {
    // paymentId comes from the Razorpay flow
    const { paymentId } = useParams();
    
    // session_id and order_id come from the Stripe flow
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");
    const orderIdParam = params.get("order_id");

    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(!!sessionId);

    // Auto-scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Verify Stripe payment if coming from Stripe checkout
    useEffect(() => {
        const verifyStripePayment = async () => {
            if (!sessionId) return;
            try {
                // Assuming you have a stripe-verify endpoint on utils or shop service
                const { data } = await axios.post(`${utilsService}/api/payment/stripe-verify`, {
                    sessionId
                });
                toast.success("Payment successful 🎉");
            } catch (error) {
                toast.error("Payment verification failed");
            } finally {
                setVerifying(false);
            }
        };
        verifyStripePayment();
    }, [sessionId]);

    const displayId = paymentId || sessionId || "txn_secure_x";

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-20">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md w-full bg-[#121212] border border-[#1F1F1F] rounded-[0.5rem] p-10 space-y-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] text-center relative overflow-hidden"
            >
                {/* Background glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/10 blur-3xl rounded-full" />

                {/* Animated checkmark icon */}
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="relative w-24 h-24 mx-auto flex items-center justify-center bg-[#0A0A0A] border border-emerald-500/30 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                    {verifying ? (
                        <BiLoader className="h-10 w-10 text-emerald-500 animate-spin" />
                    ) : (
                        <BiCheckShield className="h-12 w-12 text-emerald-500" />
                    )}
                </motion.div>

                {/* Text Content */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2 className="text-3xl font-serif italic text-[#F8F8F8] tracking-widest uppercase">
                            Order Confirmed
                        </h2>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
                            {verifying ? "Verifying Payment..." : "Payment Successful"}
                        </p>
                    </motion.div>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xs text-[#A0A0A0] leading-relaxed tracking-wider pt-2"
                    >
                        Your payment has been securely processed and your order is now being prepared for logistics.
                    </motion.p>
                </div>

                {/* Transaction Details */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[0.25rem] p-5 space-y-3"
                >
                    {orderIdParam && (
                        <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                                Order ID
                            </span>
                            <span className="text-xs font-mono text-[#D4AF37] tracking-wider">
                                {orderIdParam}
                            </span>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                            Transaction ID
                        </span>
                        <span className="text-xs font-mono text-[#D4AF37] tracking-wider truncate max-w-[200px]" title={displayId}>
                            {displayId}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-[#1F1F1F]">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                            Status
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                            {verifying ? (
                                <>
                                    <BiLoader className="animate-spin h-3 w-3" />
                                    Processing
                                </>
                            ) : (
                                <>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Verified
                                </>
                            )}
                        </span>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="space-y-4 pt-4"
                >
                    <button
                        onClick={() => navigate("/account")}
                        disabled={verifying}
                        className="w-full group relative h-14 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:tracking-[0.6em] shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:hover:tracking-[0.4em] flex items-center justify-center gap-3 rounded-[0.25rem]"
                    >
                        <BiReceipt className="h-4 w-4" />
                        View My Orders
                    </button>
                    
                    <button
                        onClick={() => navigate("/")}
                        className="w-full h-12 border border-[#1F1F1F] text-[#A0A0A0] text-[9px] font-black uppercase tracking-[0.3em] hover:border-[#D4AF37]/20 hover:text-[#D4AF37] transition-all flex items-center justify-center gap-3 rounded-[0.25rem]"
                    >
                        <BiShoppingBag className="h-4 w-4" />
                        Continue Shopping
                    </button>
                </motion.div>
                
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
