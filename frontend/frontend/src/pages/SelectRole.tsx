import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";

type Role = "customer" | "rider" | "seller" | null;

const roleIcons: Record<string, string> = {
  customer: "🛍️",
  rider: "🚴",
  seller: "🏪",
};

const roleDescriptions: Record<string, string> = {
  customer: "Browse and order from local shops",
  rider: "Deliver orders and earn money",
  seller: "List your products and sell online",
};

const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const roles: Role[] = ["customer", "rider", "seller"];

  const addRole = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);
      toast.success("Role selected!");
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while changing role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] rounded-xl border border-border bg-card p-8 shadow-sm"
      >
        {/* Brand */}
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Apni Dukan
          </h1>
        </div>

        {/* Heading */}
        <div className="mb-7 text-center">
          <h2 className="text-lg font-semibold text-secondary">
            Choose your role
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            You can only select one role to get started
          </p>
        </div>

        {/* Role Cards */}
        <div className="mb-6 space-y-3">
          {roles.map((r, i) => (
            <motion.button
              key={r}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              onClick={() => setRole(r)}
              className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-all ${
                role === r
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-secondary hover:bg-muted"
              }`}
            >
              <span className="text-xl">{roleIcons[r!]}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold capitalize">{r}</p>
                <p
                  className={`text-xs ${
                    role === r ? "text-primary/70" : "text-muted-foreground"
                  }`}
                >
                  {roleDescriptions[r!]}
                </p>
              </div>
              {/* Radio indicator */}
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  role === r
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {role === r && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </span>
            </motion.button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={addRole}
          disabled={!role || loading}
          className="w-full rounded-lg border border-border bg-card px-4 py-3.5 text-sm font-semibold text-secondary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Setting up your account..." : "Continue"}
        </button>
      </motion.div>
    </div>
  );
};

export default SelectRole;