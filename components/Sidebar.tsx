"use client";

import React from "react";
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
} from "lucide-react";
import { authService, dbService } from "@/lib/firebase";

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
  return (
    <aside className="w-80 bg-slate-950/80 border-r border-slate-800/80 backdrop-blur-md flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-900 flex items-center justify-between">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
              సారథి AI <span className="text-[8px] py-0.5 px-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-bold">Gemma 4</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-medium -mt-0.5">తెలుగు డిజిటల్ అసిస్టెంట్</p>
          </div>
        </button>

        {/* Quick Voice Launcher */}
        <button
          onClick={onLaunchVoiceMode}
          className="p-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all cursor-pointer"
          title="Launch Voice Mode"
          aria-label="Launch voice mode"
        >
          <Mic className="w-4 h-4 animate-pulse" />
        </button>
      </div>

      {/* Primary Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          కొత్త సంభాషణ (New Chat)
        </button>

        <button
          onClick={onGoHome}
          className="w-full py-2.5 px-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-350 hover:text-slate-100 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          ముఖ్య పేజీ (Dashboard Home)
        </button>
      </div>

      {/* History Chats Window */}
      <div className="flex-grow flex flex-col min-h-0 px-4 pb-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 text-slate-500" />
            ఇటీవలి సంభాషణలు (Recent Chats)
          </span>
          <span className="text-[10px] text-slate-650 bg-slate-900/40 px-1.5 py-0.5 rounded font-bold">
            {recentChats.length}
          </span>
        </div>

        <div className="flex-grow overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
          {recentChats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <MessageSquare className="w-8 h-8 text-slate-800 mb-2" />
              <p className="text-[10px] text-slate-600">సంభాషణలు ఇంకా లేవు</p>
            </div>
          ) : (
            recentChats.map((chat) => {
              const isActive = currentChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full group text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600/10 border-blue-500/30 text-blue-400 font-bold"
                      : "bg-slate-900/10 border-slate-900/50 text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                  }`}
                >
                  <span className="truncate pr-2 text-xs leading-normal">{chat.title || "తెలుగు సంభాషణ"}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-opacity cursor-pointer shrink-0"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer / User Controls */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 space-y-3">
        {/* Quick Settings shortcut */}
        <button
          onClick={onOpenSettings}
          className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <SettingsIcon className="w-4.5 h-4.5" />
          అనుకూలత సెట్టింగులు (Accessibility)
        </button>

        {/* User profile card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8.5 h-8.5 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase shrink-0">
              {user ? user.displayName?.substring(0, 2) || "UR" : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-200 truncate">
                {user ? user.displayName || "User" : "అతిథి (Guest)"}
              </h4>
              <p className="text-[9px] text-slate-500 truncate">{user ? user.email : "పరిమిత అధికారాలు"}</p>
            </div>
          </div>
          {user ? (
            <button
              onClick={() => authService.logout()}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              లాగిన్
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
