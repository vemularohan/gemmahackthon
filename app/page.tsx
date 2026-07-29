"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Mic, Landmark, Wheat, HeartPulse, LogIn, User, RefreshCw, Bookmark } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import ChatInterface from "@/components/ChatInterface";
import VoiceAssistant from "@/components/VoiceAssistant";
import AuthModal from "@/components/AuthModal";
import { authService, dbService } from "@/lib/firebase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export default function Home() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const [dashboardResetKey, setDashboardResetKey] = useState(0);

  // Sync authentication state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      // Auto-load most recent chat if logged in
      if (currentUser) {
        dbService.getChats(currentUser.uid).then((chats) => {
          if (chats && chats.length > 0) {
            setActiveChatId(chats[0].id);
            setActiveChatMessages(chats[0].messages);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync messages if chat session changes
  useEffect(() => {
    if (!activeChatId) {
      setActiveChatMessages([]);
      return;
    }
    const userId = user ? user.uid : "mock-user-id";
    dbService.getChats(userId).then((chats) => {
      const chat = chats.find((c) => c.id === activeChatId);
      if (chat) {
        setActiveChatMessages(chat.messages);
      }
    });
  }, [activeChatId]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setActiveChatMessages([]);
  };

  const handleSaveChat = async (messages: Message[]) => {
    const userId = user ? user.uid : "mock-user-id";
    const chatId = activeChatId || Math.random().toString(36).substring(7);
    
    // Generate a title based on the first message
    const title = messages[0]?.content.substring(0, 30) || "కొత్త సంభాషణ";
    
    await dbService.saveChat(userId, chatId, title, messages);
    if (!activeChatId) {
      setActiveChatId(chatId);
    }
    // Refresh dashboard listing
    setDashboardResetKey((prev) => prev + 1);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  // Triggers from dashboard quick questions/action buttons
  const handleSelectQuery = async (queryText: string, category: string) => {
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: queryText,
    };
    
    const initialMsgs = [userMsg];
    setActiveChatMessages(initialMsgs);
    
    // Create new chat ID
    const userId = user ? user.uid : "mock-user-id";
    const chatId = Math.random().toString(36).substring(7);
    setActiveChatId(chatId);

    // Save initial user message so UI displays it
    await dbService.saveChat(userId, chatId, queryText, initialMsgs, category);
    
    // Fetch AI response
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: category.startsWith("government") ? "government" : category,
          query: queryText,
        }),
      });
      const data = await res.json();
      const responseText = data.result || data.error;

      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: responseText,
      };

      const finalMsgs = [...initialMsgs, assistantMsg];
      setActiveChatMessages(finalMsgs);
      await dbService.saveChat(userId, chatId, queryText, finalMsgs, category);
      setDashboardResetKey((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync feedback from full voice mode
  const handleVoiceResponse = (userInput: string, aiResponse: string) => {
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: userInput,
    };
    const assistantMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "assistant",
      content: aiResponse,
    };
    handleSaveChat([userMsg, assistantMsg]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] selection:bg-blue-600/30 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                సారథి AI <span className="text-[10px] py-0.5 px-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold">Gemma 3</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-medium -mt-0.5">తెలుగు డిజిటల్ అసిస్టెంట్</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Action Voice launcher */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">మాట్లాడండి</span>
            </button>

            {/* Login button */}
            {!user ? (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                లాగిన్
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                {user.displayName?.substring(0, 2) || "UR"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* If a conversation thread is loaded, split layout on large screens */}
        {activeChatId ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
            <div className="lg:col-span-4 h-fit">
              <Dashboard
                key={dashboardResetKey}
                onSelectQuery={handleSelectQuery}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onLaunchVoiceMode={() => setIsVoiceOpen(true)}
                currentChatId={activeChatId}
                sidebarOnly={true}
              />
            </div>
            <div className="lg:col-span-8 min-h-[500px] flex flex-col">
              <ChatInterface
                chatId={activeChatId}
                initialMessages={activeChatMessages}
                onSaveChat={handleSaveChat}
                onLaunchVoiceMode={() => setIsVoiceOpen(true)}
              />
            </div>
          </div>
        ) : (
          /* Empty slate / Standard dashboard list */
          <div className="flex-grow flex flex-col gap-6">
            <Dashboard
              key={dashboardResetKey}
              onSelectQuery={handleSelectQuery}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              onLaunchVoiceMode={() => setIsVoiceOpen(true)}
              currentChatId={activeChatId}
            />
          </div>
        )}
      </main>

      {/* Modals & Overlay Panel Screens */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <VoiceAssistant
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onResponse={handleVoiceResponse}
      />
    </div>
  );
}
