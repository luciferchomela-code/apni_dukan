import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { BiStore, BiShield, BiMapPin } from "react-icons/bi";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

const features = [
  { icon: BiStore, label: "Browse local shops & fresh items" },
  { icon: BiMapPin, label: "Real-time delivery tracking" },
  { icon: BiShield, label: "Secure & seamless checkout" },
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
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border border-[#1F1F1F] bg-[#121212] p-8">

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center mb-4">
              <BiStore className="w-8 h-8 text-[#0A0A0A]" />
            </div>

            <h1 className="text-2xl font-bold text-[#F8F8F8] tracking-tight">
              Apni{" "}
              <span className="text-[#D4AF37]">Dukan</span>
            </h1>
            <p className="mt-1 text-xs text-[#A0A0A0] tracking-wide">
              Your neighbourhood, delivered
            </p>
          </div>

          <div className="w-full h-px bg-[#1F1F1F] mb-6" />

          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-[#F8F8F8]">Welcome back</h2>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              Sign in to continue shopping
            </p>
          </div>

          <button
            id="google-login-btn"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#1F1F1F] bg-[#1A1A1A] hover:bg-[#222222] px-5 py-3.5 font-medium text-[#F8F8F8] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#333] border-t-[#D4AF37] rounded-full animate-spin" />
                <span className="text-[#A0A0A0]">Signing you in...</span>
              </>
            ) : (
              <>
                <FcGoogle size={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="mt-6 space-y-2">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
              >
                <Icon className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="text-xs text-[#A0A0A0]">{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[11px] text-[#555] leading-relaxed">
            By continuing you agree to our{" "}
            <a href="#" className="text-[#888] underline underline-offset-2 hover:text-[#A0A0A0] transition-colors">
              Terms of Service
            </a>{" "}
            &amp;{" "}
            <a href="#" className="text-[#888] underline underline-offset-2 hover:text-[#A0A0A0] transition-colors">
              Privacy Policy
            </a>
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
