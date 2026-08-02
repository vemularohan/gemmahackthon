"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import {
  Mic,
  Send,
  Image as ImageIcon,
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  RefreshCw,
  X,
  Sparkles,
  User,
  BrainCircuit
} from "lucide-react";
import { announceToScreenReader } from "@/utils/accessibility";
import { useAccessibility } from "@/context/AccessibilityContext";
import { t } from "@/utils/translations";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface ChatInterfaceProps {
  chatId: string | null;
  initialMessages: Message[];
  onSaveChat: (messages: Message[]) => void;
  onLaunchVoiceMode: () => void;
}

function renderMarkdown(content: string) {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const code = part.slice(3, -3).replace(/^[a-zA-Z]+\n/, "");
      return (
        <pre key={index} className="bg-slate-950/80 p-4.5 rounded-2xl my-3 overflow-x-auto text-xs font-mono border border-white/5 text-slate-350 shadow-inner">
          <code>{code}</code>
        </pre>
      );
    }

    const lines = part.split("\n");
    return (
      <div key={index} className="space-y-2">
        {lines.map((line, lIdx) => {
          let cleanLine = line;

          if (cleanLine.startsWith("### ")) {
            return (
              <h4 key={lIdx} className="text-xs font-black text-slate-100 mt-4 mb-1.5 uppercase tracking-widest">
                {parseInlineMarkdown(cleanLine.substring(4))}
              </h4>
            );
          }
          if (cleanLine.startsWith("## ")) {
            return (
              <h3 key={lIdx} className="text-sm font-black text-slate-100 mt-5 mb-2">
                {parseInlineMarkdown(cleanLine.substring(3))}
              </h3>
            );
          }
          if (cleanLine.startsWith("# ")) {
            return (
              <h2 key={lIdx} className="text-base font-black text-slate-100 mt-6 mb-2">
                {parseInlineMarkdown(cleanLine.substring(2))}
              </h2>
            );
          }

          if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
            return (
              <ul key={lIdx} className="list-disc list-inside pl-3 space-y-1 text-slate-300 font-semibold text-xs leading-relaxed">
                <li>{parseInlineMarkdown(cleanLine.substring(2))}</li>
              </ul>
            );
          }

          if (/^\d+\.\s/.test(cleanLine)) {
            const dotIndex = cleanLine.indexOf(".");
            return (
              <ol key={lIdx} className="list-decimal list-inside pl-3 space-y-1 text-slate-300 font-semibold text-xs leading-relaxed">
                <li>{parseInlineMarkdown(cleanLine.substring(dotIndex + 1).trim())}</li>
              </ol>
            );
          }

          if (cleanLine.trim() === "") return <div key={lIdx} className="h-2" />;

          return (
            <p key={lIdx} className="text-slate-300 leading-relaxed text-xs font-semibold">
              {parseInlineMarkdown(cleanLine)}
            </p>
          );
        })}
      </div>
    );
  });
}

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-black text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const italicParts = part.split(/(\*.*?\*)/g);
    return italicParts.map((subPart, j) => {
      if (subPart.startsWith("*") && subPart.endsWith("*")) {
        return <em key={j} className="italic text-slate-200">{subPart.slice(1, -1)}</em>;
      }
      return subPart;
    });
  });
}

export default function ChatInterface({
  chatId,
  initialMessages,
  onSaveChat,
  onLaunchVoiceMode,
}: ChatInterfaceProps) {
  const { settings } = useAccessibility();
  const lang = settings.language || "te";
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { speak, stopSpeaking, isSpeaking } = useSpeech({
    speechRate: settings.speechRate,
    speechPitch: settings.speechPitch,
  });
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const { isListening, startListening, stopListening } = useSpeech({
    onResult: (text) => {
      if (text) setInputValue(text);
    },
    onSpeechEnd: (text) => {
      if (text) setInputValue(text);
    },
  });

  const handleSend = async () => {
    if (!inputValue.trim() && !imageFile) return;

    const userMessageText = inputValue;
    const userImage = imageFile;
    const userImageMime = imageMimeType;

    const newMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: userMessageText,
      image: userImage || undefined,
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setImageFile(null);
    setImageMimeType(null);
    setLoading(true);
    announceToScreenReader(t("srMessageSent", lang));

    try {
      let responseText = "";
      let assistantId = Math.random().toString(36).substring(7);
      if (userImage && userImageMime) {
        const base64Clean = userImage.split(",")[1];
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "explain-image",
            imageBase64: base64Clean,
            mimeType: userImageMime,
            prompt: userMessageText || undefined,
            language: lang,
          }),
        });
        const data = await res.json();
        responseText = data.result || data.error;
      } else {
        const chatHistory = updatedMessages.map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }));

        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "chat",
            messages: chatHistory,
            language: lang,
            stream: true,
            conversationId: chatId,
            profile: {
              district: settings.district,
              state: settings.state,
              occupation: settings.occupation,
              landOwnedAcres: settings.landOwnedAcres,
            },
          }),
        });

        if (!res.ok || !res.body) {
          const fallback = await res.json();
          responseText = fallback.error || "Server error";
        } else {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let streamBuffer = "";
          let doneStreaming = false;

          while (!doneStreaming) {
            const { value, done } = await reader.read();
            if (done) break;
            streamBuffer += decoder.decode(value, { stream: true });
            const events = streamBuffer.split("\n\n");
            streamBuffer = events.pop() || "";

            for (const eventText of events) {
              if (!eventText.startsWith("data: ")) continue;
              const payload = eventText.replace("data: ", "");
              const parsed = JSON.parse(payload) as {
                chunk?: string;
                done?: boolean;
                error?: string;
              };
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.chunk) {
                responseText += parsed.chunk;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId ? { ...msg, content: responseText } : msg
                  )
                );
              }
              if (parsed.done) {
                doneStreaming = true;
              }
            }
          }
        }
      }

      if (userImage) {
        assistantId = Math.random().toString(36).substring(7);
      }
      const finalMessages: Message[] = [
        ...updatedMessages,
        {
          id: assistantId,
          role: "assistant",
          content: responseText,
        },
      ];
      setMessages(finalMessages);
      onSaveChat(finalMessages);
      announceToScreenReader(t("srResponseReceived", lang));

      if (settings.autoSpeak) {
        speak(responseText, lang);
        setActiveSpeechId(assistantId);
      }
    } catch (err: any) {
      console.warn("Chat interface send failed:", err?.message || err);
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: lang === "te"
          ? "క్షమించండి, సర్వర్ లోపం సంభవించింది. దయచేసి API Key సరిచూసుకోండి."
          : "Sorry, a server error occurred. Please verify your OpenRouter API configuration.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const history = messages.slice(0, lastUserIndex + 1);
    setMessages(history);
    setLoading(true);

    try {
      const chatHistory = history.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: chatHistory,
          language: lang,
          conversationId: chatId,
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

      const finalMessages = [...history, assistantMsg];
      setMessages(finalMessages);
      onSaveChat(finalMessages);

      if (settings.autoSpeak) {
        speak(responseText, lang);
        setActiveSpeechId(assistantMsg.id);
      }
    } catch (error: any) {
      console.warn("Chat interface regenerate failed:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageFile(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    announceToScreenReader("Copied.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Saarathi AI", text });
      } catch (err) {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard instead!");
    }
  };

  const handleVoicePlay = (text: string, id: string) => {
    if (activeSpeechId === id && isSpeaking) {
      stopSpeaking();
      setActiveSpeechId(null);
    } else {
      speak(text, lang, () => setActiveSpeechId(null));
      setActiveSpeechId(id);
    }
  };

  const quickSuggestions = lang === "en" ? [
    "Verify PM Kisan schemes",
    "Pest diagnostics",
    "Tomato leaf spots"
  ] : [
    "పీఎం కిసాన్ అర్హత",
    "ఆకు తెగుళ్ల నివారణ",
    "టొమాటో ఆకు మచ్చలు"
  ];

  return (
    <div className="flex h-full w-full bg-slate-950/20 rounded-[28px] border border-white/5 overflow-hidden relative backdrop-blur-xl">
      
      {/* Main Conversation Window */}
      <div className="flex-grow flex flex-col min-w-0 h-full justify-between relative">
        
        {/* Memory Context Trigger */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowMemoryPanel(!showMemoryPanel)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/5 bg-slate-900/80 hover:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer transition-colors backdrop-blur-md shadow-md"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
            <span>{lang === "en" ? "Gemma Memory" : "జెమ్మా మెమరీ"}</span>
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          <div className="max-w-3xl mx-auto w-full space-y-6 pt-10">
            
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-24 px-6 space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-pulse shadow-lg">
                  <Sparkles className="w-7 h-7 text-emerald-450" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-black text-white">
                    {lang === "en" ? "How can I help you today?" : "నేను మీకు ఎలా సహాయం చేయగలను?"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {lang === "en" 
                      ? "Ask questions about agriculture, government schemes, or health advisories in English or Telugu." 
                      : "వ్యవసాయం, ప్రభుత్వ పథకాలు లేదా ఆరోగ్య నివారణల గురించి ఇంగ్లీష్ లేదా తెలుగులో అడగండి."}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === "user";
                const isSpeechActive = activeSpeechId === msg.id && isSpeaking;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 w-full ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {/* Assistant Avatar */}
                    {!isUser && (
                      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border border-white/5 bg-slate-900 text-emerald-450 shadow-md">
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                    )}

                    {/* Chat Bubble content */}
                    <div className={`space-y-1.5 ${isUser ? "max-w-[78%]" : "flex-1"}`}>
                      {isUser ? (
                        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-md text-xs font-semibold leading-relaxed break-words whitespace-pre-wrap">
                          {msg.image && (
                            <div className="mb-2.5 max-w-xs overflow-hidden rounded-xl border border-white/5 shadow-md">
                              <img src={msg.image} alt="Attachment" className="w-full h-auto object-cover" />
                            </div>
                          )}
                          {msg.content}
                        </div>
                      ) : (
                        <div className="text-slate-200 text-xs leading-relaxed break-words bg-slate-900/40 border border-white/5 p-5 rounded-2xl shadow-sm">
                          {renderMarkdown(msg.content)}
                          
                          {/* Chat actions */}
                          <div className="flex items-center gap-1 mt-4 pt-3.5 border-t border-white/5 text-slate-500">
                            <button
                              onClick={() => handleVoicePlay(msg.content, msg.id)}
                              className={`p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer ${isSpeechActive ? "text-sky-400 bg-sky-500/5" : "hover:text-slate-350"}`}
                            >
                              {isSpeechActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="p-2 rounded-xl hover:bg-slate-800 hover:text-slate-350 transition-colors cursor-pointer"
                            >
                              {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleShare(msg.content)}
                              className="p-2 rounded-xl hover:bg-slate-800 hover:text-slate-350 transition-colors cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border border-white/5 bg-slate-900 text-slate-400 shadow-md">
                        <User className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-3.5 w-full justify-start">
                <div className="w-9 h-9 rounded-xl border border-white/5 bg-slate-900 text-emerald-450 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-4.5 h-4.5 animate-spin" />
                </div>
                <div className="flex items-center gap-1 px-4 py-3 bg-slate-900/40 rounded-2xl border border-white/5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestion Chips */}
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto w-full px-4 mb-4 flex flex-wrap gap-2.5 justify-center">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInputValue(suggestion);
                }}
                className="text-xs bg-slate-900/60 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 px-4 py-2.5 rounded-full transition-all cursor-pointer text-slate-300 font-bold"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Attachment preview banner */}
        {imageFile && (
          <div className="max-w-3xl mx-auto w-full px-4 mb-2">
            <div className="p-2.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5">
                  <img src={imageFile} alt="Attached preview" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  {lang === "en" ? "Image ready for upload" : "చిత్రం అప్‌లోడ్‌కు సిద్ధంగా ఉంది"}
                </span>
              </div>
              <button
                onClick={() => {
                  setImageFile(null);
                  setImageMimeType(null);
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Input Area */}
        <div className="p-4 bg-transparent border-t border-white/5">
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-slate-900/90 border border-white/5 rounded-[28px] p-2.5 flex items-center gap-2 shadow-xl backdrop-blur-md">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer shrink-0"
                title="Attach picture"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                onClick={isListening ? stopListening : () => startListening(lang)}
                className={`p-3 rounded-full transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? "bg-red-950/80 text-red-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>

              <div className="flex-grow">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isListening 
                    ? (lang === "en" ? "Listening..." : "వింటున్నాను...") 
                    : t("chatPlaceholder", lang)}
                  className="w-full py-2 bg-transparent text-slate-150 placeholder:text-slate-650 focus:outline-none text-xs font-semibold"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!inputValue.trim() && !imageFile}
                className={`p-3.5 rounded-full transition-all cursor-pointer shrink-0 ${
                  inputValue.trim() || imageFile
                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                    : "text-slate-600 bg-slate-800/40 cursor-not-allowed"
                }`}
              >
                <Send className="w-4.5 h-4.5" />
              </button>

              <div className="w-px h-6 bg-slate-800 hidden sm:block mx-1.5" />

              {/* Voice Assist Button is formatted in Amber */}
              <button
                onClick={onLaunchVoiceMode}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 text-amber-450 text-xs font-black rounded-full shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "Voice Live" : "వాయిస్ లైవ్"}</span>
              </button>
            </div>

            {/* Footer disclaimers */}
            <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider px-2">
              <span>
                {lang === "en" 
                  ? "Saarathi AI. Grounded response system." 
                  : "సారథి AI. ధృవీకరించిన సమాచారం."}
              </span>
              {messages.length > 0 && (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 hover:text-slate-350 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t("regenerate", lang)}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gemma Memory & Regional Context Panel */}
      {showMemoryPanel && (
        <div className="w-80 border-l border-white/5 bg-slate-950/40 backdrop-blur-md p-6 flex flex-col justify-between shrink-0 h-full">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
                <BrainCircuit className="w-4.5 h-4.5 animate-pulse" />
                {lang === "en" ? "Gemma Memory Layer" : "జెమ్మా మెమరీ పొర"}
              </span>
              <button 
                onClick={() => setShowMemoryPanel(false)}
                className="p-1 text-slate-550 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
                <p className="font-bold text-white text-[10px] uppercase tracking-wider">{lang === "en" ? "Region Profile" : "ప్రాంత ప్రొఫైల్"}</p>
                <p className="text-slate-400">{lang === "en" ? "State" : "రాష్ట్రం"}: <span className="text-white font-semibold">{settings.state}</span></p>
                <p className="text-slate-400">{lang === "en" ? "District" : "జిల్లా"}: <span className="text-white font-semibold">{settings.district}</span></p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
                <p className="font-bold text-white text-[10px] uppercase tracking-wider">{lang === "en" ? "Farmer Context" : "వ్యవసాయ వివరాలు"}</p>
                <p className="text-slate-400">{lang === "en" ? "Occupation" : "వృత్తి"}: <span className="text-white font-semibold">{settings.occupation || "Guest"}</span></p>
                {settings.occupation === "farmer" && (
                  <p className="text-slate-400">{lang === "en" ? "Land" : "భూమి"}: <span className="text-white font-semibold">{settings.landOwnedAcres} Acres</span></p>
                )}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed font-bold bg-white/5 p-4 rounded-2xl">
            {lang === "en" 
              ? "Memory layers are dynamically injected into Gemma model prompts during orchestration."
              : "ఈ ప్రొఫైల్ వివరాలు సమాధానం సిద్ధం చేయడానికి జెమ్మా మోడల్‌కు అందించబడతాయి."}
          </div>
        </div>
      )}
    </div>
  );
}
