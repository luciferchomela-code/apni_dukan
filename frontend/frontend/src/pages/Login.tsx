import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const responseGoogle = async (authResult: any) => {
    console.log("Google response:", authResult);

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
      navigate("/");
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] rounded-xl border border-border bg-card p-8 shadow-sm"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Apni Dukan
          </h1>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold text-secondary">
            Log in or sign up to continue
          </h2>
        </div>

        {/* Google Button */}
        <button
          onClick={() => googleLogin()}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 font-medium text-secondary transition-colors hover:bg-muted disabled:opacity-60"
        >
          <FcGoogle size={20} />
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>

        {/* Legal */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree with our{" "}
          <a href="#" className="underline hover:text-secondary">
            Terms of Service
          </a>{" "}
          &amp;{" "}
          <a href="#" className="underline hover:text-secondary">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;