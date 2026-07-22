import React, { useState } from "react";
import { AlertCircle, Chrome, ShieldCheck, Zap, PhoneCall, CheckCircle2 } from "lucide-react";
import { signInWithGoogle } from "../lib/firebase";
import { User } from "../types";
import { motion } from "motion/react";
import BrandLogo from "./BrandLogo";

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      onAuthSuccess(user);
    } catch (err: any) {
      console.warn("Google Sign-In warning (handled):", err.message || err);
      let friendlyMessage = "Failed to sign in with Google. Please try again.";
      if (err.message) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col bg-[#0B1220] justify-center text-slate-100 overflow-y-auto px-6 py-10 relative select-none"
      id="auth-screen-container"
    >
      {/* Ambient Radial Background Glows (Minimal) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#2563EB]/10 rounded-full blur-[30px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-sky-500/08 rounded-full blur-[20px] pointer-events-none" />

      {/* Brand Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center z-10"
      >
        <BrandLogo size="xl" variant="full" theme="dark" showTagline={true} className="mb-4" />

        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xs leading-relaxed font-normal">
          India's premium digital exchange for genuine automotive spare parts & accessories.
        </p>
      </motion.div>

      {/* Main Glass Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-[#10192D] border border-[#18233C] rounded-2xl p-6 sm:p-8 shadow-md mt-8 max-w-md w-full mx-auto relative z-10"
      >
        <div className="border-b border-[#18233C] pb-5 mb-6 text-center">
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Welcome to Auto Parts
          </h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Sign in with Google to buy, sell, or negotiate auto parts directly with verified sellers.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start gap-3"
            id="auth-error-banner"
          >
            <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Google Sign-In Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold rounded-xl py-3.5 px-5 text-sm flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-blue-400/30"
          id="btn-google-signin"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Signing In...
              </span>
            </div>
          ) : (
            <>
              <Chrome size={20} className="text-white fill-white/20 shrink-0" />
              <span className="tracking-wide">Continue with Google</span>
            </>
          )}
        </motion.button>

        {/* Key Features Trust Grid */}
        <div className="mt-8 pt-6 border-t border-[#18233C] grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0B1220] border border-[#243353]">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-100">Verified Ads</span>
              <span className="text-[10px] text-slate-400">Genuine Parts</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0B1220] border border-[#243353]">
            <Zap size={18} className="text-[#60A5FA] shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-100">Instant Chat</span>
              <span className="text-[10px] text-slate-400">Direct Connect</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6 leading-relaxed">
          By continuing, you agree to our Terms of Service & Privacy Policy. Safe and encrypted transactions across India.
        </p>
      </motion.div>
    </div>
  );
}

