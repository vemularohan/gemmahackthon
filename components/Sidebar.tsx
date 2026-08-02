"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Pin
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
      animate={{ width: isCollapsed ? 76 : 280 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-slate-950/90 border-r border-white/5 backdrop-blur-md flex flex-col h-full shrink-0 relative z-30"
    >
      {/* Collapse toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-3.5 w-7 h-7 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800 transition-colors shadow-md shadow-black/30"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between overflow-hidden">
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer min-w-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="text-xs font-black tracking-widest text-slate-100 uppercase flex items-center gap-1">
                <span>Saarathi</span>
                <span className="text-[8px] py-0.5 px-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">G4</span>
              </h1>
            </div>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <button
          onClick={onNewChat}
          className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-md shadow-blue-600/10 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title={t("newChat", lang)}
        >
          <Plus className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="truncate">{t("newChat", lang)}</span>}
        </button>

        <button
          onClick={onGoHome}
          className={`w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title={t("goHome", lang)}
        >
          <Home className="w-4.5 h-4.5 shrink-0 text-slate-400" />
          {!isCollapsed && <span>{t("goHome", lang)}</span>}
        </button>
      </div>

      {/* Search Input Box */}
      {!isCollapsed && (
        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border border-white/5 rounded-xl">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder={lang === "en" ? "Search chats..." : "సంభాషణ శోధన..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none placeholder:text-slate-650 w-full"
            />
          </div>
        </div>
      )}

      {/* History Window */}
      <div className="flex-grow flex flex-col min-h-0 px-3 pb-2 overflow-hidden mt-2">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              {t("recentChats", lang)}
            </span>
          </div>
        )}

        <div className="flex-grow overflow-y-auto space-y-1.5 scrollbar-none pr-1">
          {filteredChats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <MessageSquare className="w-7 h-7 text-slate-800 mb-2" />
              {!isCollapsed && <p className="text-[10px] text-slate-600 font-bold">{t("noChatsYet", lang)}</p>}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = currentChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full group text-left p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600/10 border-blue-500/20 text-blue-400 font-bold shadow-md shadow-blue-500/5"
                      : "bg-slate-900/30 border-white/5 text-slate-400 hover:bg-slate-900/60 hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={chat.title}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-4 h-4 shrink-0 text-slate-500" />
                    {!isCollapsed && (
                      <span className="truncate text-xs font-semibold leading-none">
                        {chat.title || (lang === "te" ? "కొత్త చాట్" : "Conversation")}
                      </span>
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
      <div className="p-3 border-t border-white/5 bg-slate-950/60 space-y-3">
        <button
          onClick={onOpenSettings}
          className={`w-full py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title={t("accessibilitySettings", lang)}
        >
          <SettingsIcon className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span>{t("accessibilitySettings", lang)}</span>}
        </button>

        {/* User Badge */}
        <div className={`flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5 ${
          isCollapsed ? "justify-center" : ""
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs uppercase shrink-0">
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
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg transition-colors cursor-pointer shrink-0"
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
