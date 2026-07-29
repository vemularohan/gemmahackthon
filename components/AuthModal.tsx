"use client";

import React, { useState } from "react";
import { authService } from "@/lib/firebase";
import { LogIn, UserPlus, X, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.signUp(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err.message?.includes("auth/invalid-credential") || err.message?.includes("auth/user-not-found")
          ? "ఇమెయిల్ లేదా పాస్‌వర్డ్ తప్పు (Invalid email or password)"
          : err.message || "ప్రవేశించడం విఫలమైంది (Authentication failed)"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    // Already acts as guest automatically because the fallback is transparent
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-100 flex justify-center items-center gap-2">
            🚀 సారథి AI (Saarathi AI)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            సమాచారాన్ని మరియు సేవలని యాక్సెస్ చేయడానికి లాగిన్ చేయండి
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="email">
              ఇమెయిల్ అడ్రస్ (Email Address)
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full py-3 px-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="password">
              పాస్‌వర్డ్ (Password)
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-3 px-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                లాగిన్ చేయండి (Login)
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                ఖాతా సృష్టించండి (Sign Up)
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            {isLogin
              ? "కొత్త ఖాతా సృష్టించాలా? సైన్ అప్ చేయండి (Create an account)"
              : "ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి (Have an account? Login)"}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-wider">లేదా (Or)</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            onClick={handleGuestMode}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
          >
            అతిథిగా కొనసాగండి (Continue as Guest)
          </button>
        </div>
      </div>
    </div>
  );
}
