"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
  Mic,
  Home,
  User,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { authService } from "@/lib/firebase";
import { useAccessibility } from "@/context/AccessibilityContext";
import { t } from "@/utils/translations";

interface SidebarProps {
  user: any;
  recentChats: any[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
  onLaunchVoiceMode: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export default function Sidebar({
  user,
  recentChats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  onLaunchVoiceMode,
  onOpenAuth,
  onOpenSettings,
  onGoHome,
}: SidebarProps) {
  const { settings } = useAccessibility();
  const lang = settings.language || "te";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = recentChats.filter(chat => 
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 84 : 290 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="m-4 mr-0 rounded-[28px] bg-slate-950/40 border border-white/5 backdrop-blur-xl flex flex-col h-[calc(100vh-32px)] shrink-0 relative z-30 shadow-2xl overflow-hidden"
    >
      {/* Collapse toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-1 w-6 h-10 rounded-l-md bg-slate-900 border border-r-0 border-white/5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800 transition-colors shadow-md"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between overflow-hidden">
        <button
          onClick={onGoHome}
          className="flex items-center gap-3.5 text-left hover:opacity-90 transition-opacity cursor-pointer min-w-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0 border border-white/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="text-xs font-black tracking-widest text-slate-100 uppercase flex items-center gap-1.5">
                <span>Saarathi</span>
                <span className="text-[8px] py-0.5 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-bold">OS</span>
              </h1>
            </div>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2.5">
        <button
          onClick={onNewChat}
          className={`w-full py-3.5 px-4 bg-gradient-to-r from-emerald-650 to-emerald-600 hover:from-emerald-600 hover:to-emerald-550 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/10 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-emerald-500/20 ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title={t("newChat", lang)}
        >
          <Plus className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="truncate">{t("newChat", lang)}</span>}
        </button>

        <button
          onClick={onGoHome}
          className={`w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold rounded-2xl flex items-center gap-3 transition-all cursor-pointer border border-white/5 ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title={t("goHome", lang)}
        >
          <Home className="w-5 h-5 shrink-0 text-slate-400" />
          {!isCollapsed && <span>{t("goHome", lang)}</span>}
        </button>
      </div>

      {/* Search Input Box */}
      {!isCollapsed && (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder={lang === "en" ? "Search notes..." : "శోధించండి..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none placeholder:text-slate-600 w-full"
            />
          </div>
        </div>
      )}

      {/* History Window (Apple Notes Style) */}
      <div className="flex-grow flex flex-col min-h-0 px-4 pb-3 overflow-hidden mt-3">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2.5 px-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              {t("recentChats", lang)}
            </span>
          </div>
        )}

        <div className="flex-grow overflow-y-auto space-y-1.5 pr-1">
          {filteredChats.length === 0 ? (
            <div className="h-24 flex flex-col items-center justify-center text-center p-4">
              <MessageSquare className="w-6 h-6 text-slate-700 mb-2" />
              {!isCollapsed && <p className="text-[10px] text-slate-600 font-bold">{t("noChatsYet", lang)}</p>}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = currentChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full group text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900/60 border-emerald-500/20 text-emerald-450 font-bold shadow-md"
                      : "bg-white/2 border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={chat.title}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-550"}`} />
                    {!isCollapsed && (
                      <div className="min-w-0 flex flex-col">
                        <span className="truncate text-xs font-bold leading-tight">
                          {chat.title || (lang === "te" ? "కొత్త చాట్" : "Conversation")}
                        </span>
                        <span className="text-[9px] text-slate-550 truncate mt-0.5 font-medium">
                          {lang === "en" ? "Apple Notes Style Details" : "వివరాల ప్యానెల్"}
                        </span>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-opacity cursor-pointer shrink-0"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Profile Card & Settings controls */}
      <div className="p-4 border-t border-white/5 bg-slate-950/60 space-y-3">
        <button
          onClick={onOpenSettings}
          className={`w-full py-3 px-3 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-3 transition-colors cursor-pointer border border-transparent hover:border-white/5 ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title={t("accessibilitySettings", lang)}
        >
          <SettingsIcon className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>{t("accessibilitySettings", lang)}</span>}
        </button>

        {/* User Badge */}
        <div className={`flex items-center justify-between p-2 rounded-2xl bg-slate-900/60 border border-white/5 ${
          isCollapsed ? "justify-center" : ""
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 font-black text-xs uppercase shrink-0">
              {user ? user.displayName?.substring(0, 2) || "UR" : <User className="w-4 h-4" />}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <h4 className="text-xs font-bold text-slate-200 truncate">
                  {user ? user.displayName || "User" : t("guest", lang)}
                </h4>
                <p className="text-[9px] text-slate-500 truncate font-semibold">
                  {user ? user.email : t("limitedPermissions", lang)}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            user ? (
              <button
                onClick={() => authService.logout()}
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-450 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                title={t("logout", lang)}
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {t("login", lang)}
              </button>
            )
          )}
        </div>
      </div>
    </motion.aside>
  );
}
