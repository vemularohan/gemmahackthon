"use client";

import React, { useState, useEffect } from "react";
import {
  Wheat,
  HeartPulse,
  Landmark,
  Languages,
  Settings as SettingsIcon,
  Bookmark,
  MessageSquare,
  Mic,
  ArrowRight,
  LogOut,
  User,
  Plus,
  Trash2,
  BookmarkCheck,
} from "lucide-react";
import { authService, dbService } from "@/lib/firebase";
import AccessibilitySettings from "./AccessibilitySettings";

interface DashboardProps {
  onSelectQuery: (query: string, category: string) => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onLaunchVoiceMode: () => void;
  currentChatId: string | null;
}

export default function Dashboard({
  onSelectQuery,
  onSelectChat,
  onNewChat,
  onLaunchVoiceMode,
  currentChatId,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "farmer" | "health" | "government" | "translator" | "bookmarks" | "settings">("dashboard");
  const [user, setUser] = useState<any | null>(null);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  // Form states for assistants
  const [farmerQuery, setFarmerQuery] = useState("");
  const [healthQuery, setHealthQuery] = useState("");
  const [govQuery, setGovQuery] = useState("");
  const [govCategory, setGovCategory] = useState("Aadhaar");
  
  // Translator states
  const [transText, setTransText] = useState("");
  const [transDirection, setTransDirection] = useState<"en-te" | "te-en" | "roman-te">("en-te");
  const [transResult, setTransResult] = useState("");
  const [transLoading, setTransLoading] = useState(false);

  // Sync user state and load data
  useEffect(() => {
    console.log("Dashboard mounted. User status:", user ? "Logged In" : "Guest");
  }, [user]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserData(currentUser.uid);
      } else {
        setRecentChats([]);
        setBookmarks([]);
      }
    });

    return () => unsubscribe();
  }, [currentChatId]);

  const loadUserData = async (uid: string) => {
    try {
      const chats = await dbService.getChats(uid);
      setRecentChats(chats);

      const savedBookmarks = await dbService.getBookmarks(uid);
      setBookmarks(savedBookmarks);
    } catch (e) {
      console.error("Error loading user dashboard data: ", e);
    }
  };

  const handleTranslate = async () => {
    if (!transText.trim()) return;
    setTransLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          text: transText,
          direction: transDirection,
        }),
      });
      const data = await res.json();
      setTransResult(data.result);
    } catch (e) {
      console.error(e);
      setTransResult("అనువాదంలో లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.");
    } finally {
      setTransLoading(false);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, cid: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await dbService.deleteChat(user.uid, cid);
      loadUserData(user.uid);
      if (currentChatId === cid) {
        onNewChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBookmark = async (bid: string) => {
    if (!user) return;
    try {
      await dbService.deleteBookmark(user.uid, bid);
      loadUserData(user.uid);
    } catch (err) {
      console.error(err);
    }
  };

  const demoQueries = [
    { text: "నాకు రైతు బంధు పథకం గురించి చెప్పు", cat: "farmer" },
    { text: "ఈ మందు ఎలా వాడాలి?", cat: "health" },
    { text: "నా బిడ్డకు జ్వరం ఉంది", cat: "health" },
    { text: "Aadhaar update ఎలా చేయాలి?", cat: "government" },
    { text: "ఈ పంటకు ఏ ఎరువు వేయాలి?", cat: "farmer" },
    { text: "Meeting ki late avthanu", cat: "translator" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* LEFT SIDEBAR: User info & Recent Chats */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        {/* User Card */}
        <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold uppercase">
              {user ? user.displayName?.substring(0, 2) || "UR" : "G"}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">
                {user ? user.displayName || "Saarathi User" : "అతిథి (Guest)"}
              </h4>
              <p className="text-[10px] text-slate-500">{user ? user.email : "పరిమిత అధికారాలు"}</p>
            </div>
          </div>
          {user && (
            <button
              onClick={() => authService.logout()}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Recent Chats List */}
        <div className="glass-panel flex-grow p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col min-h-[250px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              ఇటీవలి సంభాషణలు (Chats)
            </h3>
            <button
              onClick={onNewChat}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-grow space-y-2 overflow-y-auto max-h-[300px] pr-1">
            {recentChats.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-8">ఇంకా చాట్స్ లేవు</p>
            ) : (
              recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between group transition-all cursor-pointer ${
                    currentChatId === chat.id
                      ? "bg-blue-600/10 border-blue-500/30 text-blue-400 font-bold"
                      : "bg-slate-950/20 border-slate-900 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className="truncate pr-2">{chat.title || "తెలుగు సంభాషణ"}</span>
                  <span className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 rounded transition-opacity cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" onClick={(e) => handleDeleteChat(e, chat.id)} />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CENTER WORKSPACE: Feature tabs */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 p-1 bg-slate-950/40 rounded-xl border border-slate-900">
          {(
            [
              { id: "dashboard", label: "డ్యాష్‌బోర్డ్", icon: Landmark },
              { id: "farmer", label: "రైతు బజార్", icon: Wheat },
              { id: "health", label: "ఆరోగ్యం", icon: HeartPulse },
              { id: "government", label: "సేవలు", icon: Landmark },
              { id: "translator", label: "భాషాంతరం", icon: Languages },
              { id: "bookmarks", label: "బుక్‌మార్క్స్", icon: Bookmark },
              { id: "settings", label: "సెట్టింగ్స్", icon: SettingsIcon },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  console.log("Tab changed in dashboard:", tab.id);
                  setActiveTab(tab.id);
                }}
                className={`py-2 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate w-full text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-grow">
          {/* 1. Main Dashboard Hub */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-sky-600 border border-blue-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase bg-sky-500/20 border border-sky-400/20 text-sky-200 rounded-full">సాంకేతిక సహాయం</span>
                  <h2 className="text-2xl font-black text-white">సారథి AI - మీ డిజిటల్ తోడు</h2>
                  <p className="text-xs text-blue-100 max-w-md leading-relaxed">
                    వ్యవసాయం, ఆరోగ్యం, ప్రభుత్వ పథకాలు, మరియు అనువాద సేవలను మీ సొంత భాష తెలుగులో సులభంగా యాక్సెస్ చేయండి.
                  </p>
                </div>
                <button
                  onClick={onLaunchVoiceMode}
                  className="flex items-center gap-2 py-4 px-6 bg-white hover:bg-slate-100 text-blue-600 text-sm font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-105 cursor-pointer shrink-0"
                >
                  <Mic className="w-5 h-5 text-blue-600 animate-bounce" />
                  మాట్లాడటం ప్రారంభించండి
                </button>
              </div>

              {/* Demo Questions Section */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 pl-1">
                  తరచుగా అడిగే ప్రశ్నలు (Quick Questions)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {demoQueries.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        console.log("Demo query clicked:", item.text);
                        onSelectQuery(item.text, item.cat);
                      }}
                      className="text-left p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 text-xs text-slate-300 flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <span className="font-semibold leading-normal">{item.text}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Farmer Corner */}
          {activeTab === "farmer" && (
            <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <Wheat className="w-6 h-6 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-100">వ్యవసాయ సహాయకుడు (Farmer Corner)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                పంట వ్యాధులు, సరైన ఎరువులు, మార్కెట్ ధరలు, సేంద్రీయ వ్యవసాయం, మరియు ప్రభుత్వ సహాయక పథకాల గురించి తెలుగులో సమాచారం పొందండి.
              </p>
              <div className="space-y-3">
                <textarea
                  value={farmerQuery}
                  onChange={(e) => setFarmerQuery(e.target.value)}
                  placeholder="ఉదాహరణకు: వరి పంటలో తెగుళ్ళను అరికట్టడం ఎలా? లేదా రైతు భరోసా పథకం అర్హతలు ఏమిటి?"
                  className="w-full h-24 py-3 px-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                />
                <button
                  onClick={() => {
                    if (farmerQuery.trim()) onSelectQuery(farmerQuery, "farmer");
                  }}
                  className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  సలహా పొందండి (Get Advice)
                </button>
              </div>
            </div>
          )}

          {/* 3. Healthcare Assistant */}
          {activeTab === "health" && (
            <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <HeartPulse className="w-6 h-6 text-red-500 animate-pulse" />
                <h3 className="text-lg font-bold text-slate-100">ఆరోగ్య సహాయకుడు (Health Assistant)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                ఆరోగ్య సంరక్షణ, సాధారణ రోగాల లక్షణాలు, మరియు డాక్టర్ సంప్రదింపు సలహాలను పొందండి.
              </p>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-400 rounded-xl">
                ⚠️ గమనిక: ఇది కేవలం ప్రాథమిక సమాచారం కోసం మాత్రమే. అత్యవసర పరిస్థితుల్లో దయచేసి వైద్యుడిని సంప్రదించండి.
              </div>
              <div className="space-y-3">
                <textarea
                  value={healthQuery}
                  onChange={(e) => setHealthQuery(e.target.value)}
                  placeholder="ఉదాహరణకు: జలుబు మరియు దగ్గు నివారణకు ఎలాంటి చిట్కాలు ఉన్నాయి? లేదా ఈ పారాసిటమాల్ టాబ్లెట్ ఎప్పుడు వాడాలి?"
                  className="w-full h-24 py-3 px-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                />
                <button
                  onClick={() => {
                    if (healthQuery.trim()) onSelectQuery(healthQuery, "health");
                  }}
                  className="py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  వివరణ కోరండి (Ask Health Advisor)
                </button>
              </div>
            </div>
          )}

          {/* 4. Government Assistant */}
          {activeTab === "government" && (
            <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <Landmark className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-100">ప్రభుత్వ సేవలు (Government Services)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                ఆధార్ కార్డ్ అప్డేట్స్, మీసేవ దరఖాస్తులు, పింఛన్లు, స్కాలర్‌షిప్పులు, మరియు రేషన్ కార్డ్ గురించి కచ్చితమైన సమాచారం.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Aadhaar", "MeeSeva", "Pension", "Ration Card", "Income Certificate"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGovCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      govCategory === cat
                        ? "bg-amber-600 border-amber-500 text-white"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <textarea
                  value={govQuery}
                  onChange={(e) => setGovQuery(e.target.value)}
                  placeholder={`ఉదాహరణకు: ${govCategory} అప్డేట్ చేసుకోవడానికి అవసరమైన డాక్యుమెంట్లు ఏమిటి?`}
                  className="w-full h-24 py-3 px-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                />
                <button
                  onClick={() => {
                    if (govQuery.trim()) onSelectQuery(govQuery, `government:${govCategory}`);
                  }}
                  className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  సమాచారం అడగండి (Query Gov Services)
                </button>
              </div>
            </div>
          )}

          {/* 5. Translator */}
          {activeTab === "translator" && (
            <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <Languages className="w-6 h-6 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-100">భాషాంతర సేవ (Translation)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                తెలుగు నుండి ఇంగ్లీష్, ఇంగ్లీష్ నుండి తెలుగు మరియు రోమన్ తెలుగు (Tanglish) ని తెలుగులోకి మార్చండి.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "en-te", label: "English ➔ Telugu" },
                  { id: "te-en", label: "Telugu ➔ English" },
                  { id: "roman-te", label: "Roman Telugu ➔ Telugu script" },
                ].map((dir) => (
                  <button
                    key={dir.id}
                    onClick={() => setTransDirection(dir.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      transDirection === dir.id
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  value={transText}
                  onChange={(e) => setTransText(e.target.value)}
                  placeholder="ఇక్కడ టెక్స్ట్ నమోదు చేయండి..."
                  className="h-28 py-3 px-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                />
                <div className="h-28 py-3 px-4 rounded-2xl bg-slate-950/30 border border-slate-800/50 text-slate-200 text-sm overflow-y-auto">
                  {transLoading ? (
                    <span className="text-slate-500 italic">అనువదిస్తోంది (Translating)...</span>
                  ) : (
                    transResult || <span className="text-slate-650 italic">ఇక్కడ అనువాదం కనిపిస్తుంది...</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleTranslate}
                disabled={transLoading || !transText.trim()}
                className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                అనువదించు (Translate)
              </button>
            </div>
          )}

          {/* 6. Bookmarks */}
          {activeTab === "bookmarks" && (
            <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <BookmarkCheck className="w-6 h-6 text-sky-400" />
                <h3 className="text-lg font-bold text-slate-100">నా బుక్‌మార్క్స్ (Bookmarks)</h3>
              </div>

              {bookmarks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-12">బుక్‌మార్క్ చేసిన ప్రశ్నలు ఏవీ లేవు</p>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 rounded-full">
                          {bm.type}
                        </span>
                        <h4 className="text-sm font-bold text-slate-200">{bm.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-2">{bm.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBookmark(bm.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. Settings */}
          {activeTab === "settings" && <AccessibilitySettings />}
        </div>
      </div>
    </div>
  );
}
