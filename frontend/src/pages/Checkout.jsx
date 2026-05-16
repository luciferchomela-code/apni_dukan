import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { shopService } from "../main";
import { motion, AnimatePresence } from "framer-motion";
import {
    BiMapPin,
    BiPhone,
    BiCheckCircle,
    BiArrowBack,
    BiShoppingBag,
    BiLoader,
    BiCreditCard,
    BiShield,
    BiPackage,
} from "react-icons/bi";

const utilsService = "http://localhost:5002";

const Checkout = () => {
    const { cart, subTotal, quantity, fetchCart, location, shopLocation } = useAppData();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [loadingRazorpay, setLoadingRazorpay] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);

    // Haversine distance (km) between two lat/lng points
    const distanceKm = (lat1, lon1, lat2, lon2) => {
        const toRad = (d) => (d * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.asin(Math.sqrt(a));
    };

    const computedDistance =
        location && shopLocation?.coordinates
            ? distanceKm(
                  location.latitude,
                  location.longitude,
                  shopLocation.coordinates[1], // lat
                  shopLocation.coordinates[0]  // lon
              )
            : 0;
    
    const deliveryFee = Math.ceil(computedDistance * 5);
    const platformFee = Number((subTotal * 0.05).toFixed(2));
    const grandTotal  = Number((subTotal + deliveryFee + platformFee).toFixed(2));
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const { data } = await axios.get(
                    `${shopService}/api/address/all`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const list = data.addresses || [];
                setAddresses(list);
                if (list.length > 0) setSelectedAddressId(list[0]._id);
            } catch {
                toast.error("Failed to load addresses");
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, []);

    if (!cart || cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-12 px-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#D4AF37]/5 blur-3xl rounded-full" />
                    <BiShoppingBag className="h-24 w-24 text-[#1F1F1F] relative z-10" />
                </div>
                <div className="text-center space-y-4 max-w-sm">
                    <h2 className="text-3xl font-serif italic text-[#F8F8F8] tracking-widest uppercase">
                        Your cart is empty
                    </h2>
                    <p className="text-[11px] text-[#A0A0A0] leading-relaxed tracking-wider opacity-60 uppercase">
                        Add items to your cart before proceeding to checkout.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.5em] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all"
                >
                    <BiArrowBack className="h-4 w-4" />
                    Explore Marketplace
                </button>
            </div>
        );
    }

    if (loadingAddresses) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-8">
                <div className="h-12 w-12 border border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.6em]">
                    Securing your session...
                </p>
            </div>
        );
    }

    const createOrder = async (paymentMethod = "razorpay") => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return null;
        }
        setCreatingOrder(true);
        try {
            const { data } = await axios.post(
                `${shopService}/api/order/new`,
                {
                    addressId: selectedAddressId,
                    paymentMethod,
                    distance: computedDistance,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create order");
            return null;
        } finally {
            setCreatingOrder(false);
        }
    };

    const payWithRazorpay = async () => {
        setLoadingRazorpay(true);
        try {
            const orderData = await createOrder("razorpay");
            if (!orderData) return;

            const { orderId, pricing } = orderData;

            const { data } = await axios.post(
                `${utilsService}/api/payment/create`,
                { orderId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const { razorpayOrderId, key } = data;

            const options = {
                key,
                amount: pricing.totalAmount * 100,
                currency: "INR",
                name: "Apni Dukan",
                description: "Secure Online Shopping",
                order_id: razorpayOrderId,
                handler: async (res) => {
                    try {
                        await axios.post(
                            `${utilsService}/api/payment/verify`,
                            {
                                razorpay_order_id: res.razorpay_order_id,
                                razorpay_payment_id: res.razorpay_payment_id,
                                razorpay_signature: res.razorpay_signature,
                                orderId,
                            }
                        );
                        toast.success("Payment successful ✌️");
                        fetchCart();
                        navigate("/payment-success/" + res.razorpay_payment_id);
                    } catch {
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {},
                theme: { color: "#D4AF37" },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error(error);
            toast.error("Payment initiation failed");
        } finally {
            setLoadingRazorpay(false);
        }
    };

    const shopName =
        cart[0]?.shopId && typeof cart[0].shopId === "object"
            ? cart[0].shopId.name
            : "Apni Dukan";

    const isLoading = loadingRazorpay || creatingOrder;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#A0A0A0] pb-40">
            <div className="h-[28vh] flex flex-col items-center justify-center border-b border-[#1F1F1F] bg-[#0A0A0A] px-6 text-center">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-8 bg-[#D4AF37]/30" />
                    <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em]">
                        Secure Checkout
                    </span>
                    <div className="h-[1px] w-8 bg-[#D4AF37]/30" />
                </div>
                <h1 className="text-5xl font-serif italic text-[#F8F8F8] tracking-[0.2em] uppercase">
                    Confirm Order
                </h1>
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                    {shopName}
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 py-20">

                <div className="lg:col-span-2 space-y-16">

                    <section className="space-y-8">
                        <div className="flex items-center gap-4 border-b border-[#1F1F1F] pb-6">
                            <BiPackage className="h-4 w-4 text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
                                Your Selection ({quantity})
                            </span>
                        </div>

                        <AnimatePresence>
                            {cart.map((item, idx) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-8 bg-[#121212] border border-[#1F1F1F] p-6 rounded-[0.25rem] hover:border-[#D4AF37]/10 transition-all"
                                >
                                    <div className="h-20 w-20 flex-shrink-0 bg-[#0A0A0A] overflow-hidden rounded-[0.25rem] border border-[#1F1F1F]">
                                        <img
                                            src={item.itemId?.image}
                                            alt={item.itemId?.name}
                                            className="h-full w-full object-contain p-3 mix-blend-lighten"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-serif italic text-[#F8F8F8] tracking-wider truncate">
                                            {item.itemId?.name}
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                            Qty: {item.quantity}
                                        </span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-xl font-black text-[#F8F8F8] tracking-tighter">
                                            ₹{(item.itemId?.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </section>

                    {/* Address Selection */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 border-b border-[#1F1F1F] pb-6">
                            <BiMapPin className="h-4 w-4 text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
                                Delivery Address
                            </span>
                        </div>

                        {addresses.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-16 space-y-6 bg-[#121212] border border-[#1F1F1F] rounded-[0.25rem]"
                            >
                                <div className="p-6 rounded-full border border-[#D4AF37]/5 bg-[#0A0A0A]">
                                    <BiMapPin className="h-10 w-10 text-[#D4AF37]/10" />
                                </div>
                                <div className="text-center space-y-3">
                                    <h3 className="text-xl font-serif italic text-[#F8F8F8] tracking-widest uppercase">
                                        No Addresses Found
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                        Save a delivery address to continue
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate("/address")}
                                    className="flex items-center gap-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all"
                                >
                                    <BiMapPin className="h-4 w-4" />
                                    Add Address
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {addresses.map((addr, idx) => {
                                    const isSelected = selectedAddressId === addr._id;
                                    return (
                                        <motion.button
                                            key={addr._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.06 }}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                            id={`address-${addr._id}`}
                                            className={`w-full text-left flex items-start gap-6 p-6 rounded-[0.25rem] border transition-all duration-300 group ${
                                                isSelected
                                                    ? "bg-[#D4AF37]/5 border-[#D4AF37]/40 shadow-[0_0_30px_rgba(212,175,55,0.05)]"
                                                    : "bg-[#121212] border-[#1F1F1F] hover:border-[#D4AF37]/20"
                                            }`}
                                        >
                                            {/* Radio indicator */}
                                            <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                isSelected
                                                    ? "border-[#D4AF37]"
                                                    : "border-[#333]"
                                            }`}>
                                                {isSelected && (
                                                    <div className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-2">
                                                <p className={`text-[13px] font-medium tracking-wider leading-relaxed transition-colors ${
                                                    isSelected ? "text-[#F8F8F8]" : "text-[#A0A0A0]"
                                                }`}>
                                                    {addr.formattedAddress}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <BiPhone className="h-3 w-3 text-[#D4AF37]/40" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                                                        {addr.mobile}
                                                    </span>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <BiCheckCircle className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                            )}
                                        </motion.button>
                                    );
                                })}

                                <button
                                    onClick={() => navigate("/address")}
                                    className="w-full py-4 border border-dashed border-[#D4AF37]/15 rounded-[0.25rem] text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all flex items-center justify-center gap-3"
                                >
                                    <BiMapPin className="h-4 w-4" />
                                    Add New Address
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* ── RIGHT: Order Summary + Payment ── */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">

                        {/* Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#121212] border border-[#1F1F1F] p-10 rounded-[0.25rem] space-y-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                        >
                            {/* Header */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <BiCheckCircle className="text-[#D4AF37] h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
                                        Order Summary
                                    </span>
                                </div>
                                <h4 className="text-2xl font-serif italic text-[#F8F8F8] tracking-widest uppercase">
                                    Your Bill
                                </h4>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-5 border-b border-[#1F1F1F] pb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                                        Subtotal
                                    </span>
                                    <span className="text-sm font-bold text-[#F8F8F8]">
                                        ₹{subTotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 block">
                                            Delivery Fee
                                        </span>
                                        {deliveryFee === 0 && (
                                            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500">
                                                Free Delivery
                                            </span>
                                        )}
                                    </div>
                                    {deliveryFee === 0 ? (
                                        <span className="text-sm font-black text-emerald-500 italic">Free</span>
                                    ) : (
                                        <span className="text-sm font-bold text-[#D4AF37]">₹{deliveryFee}</span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                                        Platform Fee (5%)
                                    </span>
                                    <span className="text-sm font-bold text-[#F8F8F8]">₹{platformFee}</span>
                                </div>
                            </div>

                            {/* Grand Total */}
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#F8F8F8]">
                                    Grand Total
                                </span>
                                <span className="text-4xl font-black text-[#D4AF37] tracking-tighter">
                                    ₹{grandTotal}
                                </span>
                            </div>

                            {/* Security badge */}
                            <div className="flex items-center justify-center gap-3 opacity-20">
                                <BiShield className="h-4 w-4" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                    256-bit Encrypted
                                </span>
                            </div>
                        </motion.div>

                        {/* ── Payment Buttons ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            {/* Razorpay */}
                            <button
                                id="btn-pay-razorpay"
                                onClick={payWithRazorpay}
                                disabled={isLoading || addresses.length === 0}
                                className="w-full group relative h-16 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.6em] transition-all hover:tracking-[0.8em] shadow-[0_0_20px_rgba(212,175,55,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:tracking-[0.6em] flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <BiLoader className="h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <BiCreditCard className="h-4 w-4" />
                                        Pay ₹{grandTotal} via Razorpay
                                    </>
                                )}
                            </button>

                            {/* Back to cart */}
                            <button
                                id="btn-back-cart"
                                onClick={() => navigate("/cart")}
                                disabled={isLoading}
                                className="w-full h-12 border border-[#1F1F1F] text-[#A0A0A0] text-[10px] font-black uppercase tracking-[0.4em] hover:border-[#D4AF37]/20 hover:text-[#D4AF37] transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                            >
                                <BiArrowBack className="h-4 w-4" />
                                Back to Cart
                            </button>
                        </motion.div>

                        {/* Address warning */}
                        <AnimatePresence>
                            {!selectedAddressId && addresses.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-[0.25rem] p-4"
                                >
                                    <BiMapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-500/80">
                                        Select a delivery address to proceed
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;