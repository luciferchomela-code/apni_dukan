import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { BiStore, BiShieldCheck, BiMapPin } from "react-icons/bi";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

const features = [
  { icon: BiStore, label: "Browse local shops & fresh items" },
  { icon: BiMapPin, label: "Real-time delivery tracking" },
  { icon: BiShieldCheck, label: "Secure & seamless checkout" },
];

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const responseGoogle = async (authResult) => {
    if (!authResult?.code) {
      toast.error("Google login failed");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult.code,
      });
      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setUser(result.data.user);
      setIsAuth(true);
      if (!result.data.user.role) {
        navigate("/select-role");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error("Problem while login");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080810]">

      {/* ── Animated gradient background ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#080810] to-[#0a0a1a]" />

        {/* Floating orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[140px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-700/15 blur-[100px]"
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glass card */}
        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden p-8">

          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

          {/* ── Logo / Brand ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col items-center mb-8"
          >
            {/* Icon badge */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
                <BiStore className="w-10 h-10 text-white" />
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 blur-xl opacity-40 -z-10 scale-110" />
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight">
              Apni{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Dukan
              </span>
            </h1>
            <p className="mt-1.5 text-sm font-medium text-white/40 tracking-wide">
              Your neighbourhood, delivered
            </p>
          </motion.div>

          {/* ── Divider ── */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-7" />

          {/* ── Heading ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-center mb-6"
          >
            <h2 className="text-xl font-bold text-white/90">Welcome back 👋</h2>
            <p className="mt-1 text-sm text-white/40">
              Sign in to continue shopping
            </p>
          </motion.div>

          {/* ── Google Button ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <button
              id="google-login-btn"
              onClick={() => googleLogin()}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.1] hover:border-white/20 px-5 py-4 font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-black/20"
            >
              {/* Button shimmer on hover */}
              <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-violet-500/10 via-transparent to-indigo-500/10" />

              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                  <span className="text-white/70">Signing you in...</span>
                </>
              ) : (
                <>
                  <FcGoogle size={22} />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </motion.div>

          {/* ── Feature pills ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-7 space-y-2.5"
          >
            {features.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.48 + i * 0.07 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <span className="text-xs font-medium text-white/40">{label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* ── ToS ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-7 text-center text-[11px] text-white/25 leading-relaxed"
          >
            By continuing you agree to our{" "}
            <a href="#" className="text-white/45 underline underline-offset-2 hover:text-white/70 transition-colors">
              Terms of Service
            </a>{" "}
            &amp;{" "}
            <a href="#" className="text-white/45 underline underline-offset-2 hover:text-white/70 transition-colors">
              Privacy Policy
            </a>
          </motion.p>

          {/* Bottom shimmer line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
        </div>

        {/* Outer glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 blur-2xl -z-10 scale-105" />
      </motion.div>
    </div>
  );
};

export default Login;
