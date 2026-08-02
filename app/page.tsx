"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Mic, LogIn, Menu, X, ArrowLeft, Globe } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ChatInterface from "@/components/ChatInterface";
import VoiceAssistant from "@/components/VoiceAssistant";
import AuthModal from "@/components/AuthModal";
import OnboardingFlow from "@/components/OnboardingFlow";
import LandingPage from "@/components/LandingPage";
import { authService, dbService } from "@/lib/firebase";
import { useAccessibility } from "@/context/AccessibilityContext";
import { t } from "@/utils/translations";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  category?: string;
}

export default function Home() {
  const { settings, updateSetting } = useAccessibility();
  const lang = settings.language || "te";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);

  // Sync authentication state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      const userId = currentUser ? currentUser.uid : "mock-user-id";
      loadRecentChats(userId);
    });
    return () => unsubscribe();
  }, []);

  // Reload chats when active session changes
  useEffect(() => {
    const userId = user ? user.uid : "mock-user-id";
    loadRecentChats(userId);
    
    if (activeChatId) {
      dbService.getChats(userId).then((chats: ChatSession[]) => {
        const chat = chats.find((c) => c.id === activeChatId);
        if (chat) {
          setActiveChatMessages(chat.messages);
        }
      });
    } else {
      setActiveChatMessages([]);
    }
  }, [activeChatId, user]);

  const loadRecentChats = async (userId: string) => {
    try {
      const chats = await dbService.getChats(userId) as ChatSession[];
      setRecentChats(chats);
    } catch (e) {
      console.warn("Error loading chats:", e);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setActiveChatMessages([]);
    setIsMobileSidebarOpen(false);
  };

  const handleSaveChat = async (messages: Message[]) => {
    const userId = user ? user.uid : "mock-user-id";
    const chatId = activeChatId || Math.random().toString(36).substring(7);
    
    // Generate a title based on the first message
    const title = messages[0]?.content.substring(0, 30) || (lang === "te" ? "కొత్త సంభాషణ" : "New Chat");
    
    await dbService.saveChat(userId, chatId, title, messages);
    if (!activeChatId) {
      setActiveChatId(chatId);
    }
    loadRecentChats(userId);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    const userId = user ? user.uid : "mock-user-id";
    try {
      await dbService.deleteChat(userId, chatId);
      if (activeChatId === chatId) {
        handleNewChat();
      } else {
        loadRecentChats(userId);
      }
    } catch (e) {
      console.warn("Delete chat failed:", e);
    }
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
    
    const userId = user ? user.uid : "mock-user-id";
    const chatId = Math.random().toString(36).substring(7);
    setActiveChatId(chatId);

    // Save initial user message
    await dbService.saveChat(userId, chatId, queryText, initialMsgs, category);
    
    // Fetch AI response
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: category.startsWith("government") ? "government" : category,
          query: queryText,
          language: lang,
          profile: {
            district: settings.district,
            state: settings.state,
            occupation: settings.occupation,
            landOwnedAcres: settings.landOwnedAcres,
          },
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
      loadRecentChats(userId);
    } catch (e) {
      console.warn("Error running initial query:", e);
    }
  };

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

  // If onboarding is not completed, render the Landing page
  if (!settings.onboardingDone) {
    return (
      <div className="relative h-screen w-screen bg-[#070b13] overflow-hidden">
        <LandingPage 
          onStartOnboarding={() => {
            // Trigger onboarding flow showing
            updateSetting("onboardingDone", false);
          }}
          onLaunchVoiceMode={() => setIsVoiceOpen(true)}
        />
        <OnboardingFlow />
        <VoiceAssistant
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onResponse={handleVoiceResponse}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* DESKTOP SIDEBAR: Hidden on mobile */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar
          user={user}
          recentChats={recentChats}
          currentChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onNewChat={handleNewChat}
          onLaunchVoiceMode={() => setIsVoiceOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSettings={() => {
            handleNewChat();
            setTimeout(() => {
              const settingsBtn = document.querySelector('button[aria-pressed]');
              if (settingsBtn) (settingsBtn as HTMLButtonElement).click();
            }, 100);
          }}
          onGoHome={handleNewChat}
        />
      </div>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden bg-slate-950/60 backdrop-blur-sm">
          <div className="relative flex flex-col h-full animate-slideIn">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-[-50px] p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              user={user}
              recentChats={recentChats}
              currentChatId={activeChatId}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              onNewChat={handleNewChat}
              onLaunchVoiceMode={() => setIsVoiceOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenSettings={() => {
                handleNewChat();
                setIsMobileSidebarOpen(false);
              }}
              onGoHome={handleNewChat}
            />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        {/* Unified SaaS Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {activeChatId ? (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("backToHome", lang)}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center lg:hidden">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h1 className="text-sm font-black text-white lg:hidden">{t("brandName", lang)}</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextLang = lang === "te" ? "en" : "te";
                updateSetting("language", nextLang);
              }}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 rounded-xl transition-colors cursor-pointer"
              title={lang === "te" ? "Switch to English" : "తెలుగులోకి మార్చండి"}
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>{lang === "te" ? "English" : "తెలుగు"}</span>
            </button>

            <button
              onClick={() => setIsVoiceOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>{t("voiceAssistant", lang)}</span>
            </button>

            {!user && (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {t("login", lang)}
              </button>
            )}
          </div>
        </header>

        {/* Main Panel Content */}
        <div className="flex-grow overflow-hidden relative p-4 md:p-6 lg:p-8 flex flex-col">
          {activeChatId ? (
            <div className="flex-grow h-full overflow-hidden">
              <ChatInterface
                chatId={activeChatId}
                initialMessages={activeChatMessages}
                onSaveChat={handleSaveChat}
                onLaunchVoiceMode={() => setIsVoiceOpen(true)}
              />
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto scrollbar-thin pr-1">
              <Dashboard
                onSelectQuery={handleSelectQuery}
                onNewChat={handleNewChat}
                onLaunchVoiceMode={() => setIsVoiceOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals & Overlays */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <VoiceAssistant
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onResponse={handleVoiceResponse}
      />
    </div>
  );
}
