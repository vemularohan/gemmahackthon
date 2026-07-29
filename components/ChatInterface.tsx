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
  CornerDownLeft,
  X,
  User,
  Sparkles,
} from "lucide-react";
import { announceToScreenReader } from "@/utils/accessibility";
import { useAccessibility } from "@/context/AccessibilityContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // Optional base64 image URL
}

interface ChatInterfaceProps {
  chatId: string | null;
  initialMessages: Message[];
  onSaveChat: (messages: Message[]) => void;
  onLaunchVoiceMode: () => void;
}

// Custom simple markdown formatter to render formatted bold, italic, code blocks, bullet points, and headers
function renderMarkdown(content: string) {
  if (!content) return null;

  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // If it's a code block
    if (part.startsWith("```") && part.endsWith("```")) {
      const code = part.slice(3, -3).replace(/^[a-zA-Z]+\n/, "");
      return (
        <pre key={index} className="bg-slate-950 p-4 rounded-xl my-3 overflow-x-auto text-xs font-mono border border-slate-800 text-slate-300">
          <code>{code}</code>
        </pre>
      );
    }

    // Process inline elements like bold, lists, and newlines
    const lines = part.split("\n");
    return (
      <div key={index} className="space-y-2">
        {lines.map((line, lIdx) => {
          let cleanLine = line;

          // Headers
          if (cleanLine.startsWith("### ")) {
            return (
              <h4 key={lIdx} className="text-base font-bold text-slate-100 mt-3 mb-1">
                {parseInlineMarkdown(cleanLine.substring(4))}
              </h4>
            );
          }
          if (cleanLine.startsWith("## ")) {
            return (
              <h3 key={lIdx} className="text-lg font-extrabold text-slate-100 mt-4 mb-2">
                {parseInlineMarkdown(cleanLine.substring(3))}
              </h3>
            );
          }
          if (cleanLine.startsWith("# ")) {
            return (
              <h2 key={lIdx} className="text-xl font-black text-slate-100 mt-5 mb-2">
                {parseInlineMarkdown(cleanLine.substring(2))}
              </h2>
            );
          }

          // Bullet points
          if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
            return (
              <ul key={lIdx} className="list-disc list-inside pl-3 space-y-1 text-slate-300">
                <li>{parseInlineMarkdown(cleanLine.substring(2))}</li>
              </ul>
            );
          }

          // Numbered lists
          if (/^\d+\.\s/.test(cleanLine)) {
            const dotIndex = cleanLine.indexOf(".");
            return (
              <ol key={lIdx} className="list-decimal list-inside pl-3 space-y-1 text-slate-300">
                <li>{parseInlineMarkdown(cleanLine.substring(dotIndex + 1).trim())}</li>
              </ol>
            );
          }

          // Plain text line
          if (cleanLine.trim() === "") return <div key={lIdx} className="h-2" />;

          return (
            <p key={lIdx} className="text-slate-300 leading-relaxed">
              {parseInlineMarkdown(cleanLine)}
            </p>
          );
        })}
      </div>
    );
  });
}

function parseInlineMarkdown(text: string) {
  // Regex to match bold **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Regex for italic *text*
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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup TTS
  const { speak, stopSpeaking, isSpeaking } = useSpeech();
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Sync prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Setup STT in input bar
  const { isListening, transcript, startListening, stopListening } = useSpeech({
    onResult: (text) => {
      if (text) {
        setInputValue(text);
      }
    },
    onSpeechEnd: (text) => {
      if (text) {
        setInputValue(text);
      }
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
    announceToScreenReader("సందేశం పంపబడింది. ప్రతిస్పందన కోసం వేచి ఉంది.");

    try {
      let responseText = "";
      if (userImage && userImageMime) {
        // Image action
        const base64Clean = userImage.split(",")[1];
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "explain-image",
            imageBase64: base64Clean,
            mimeType: userImageMime,
            prompt: userMessageText || undefined,
          }),
        });
        const data = await res.json();
        responseText = data.result || data.error;
      } else {
        // Normal chat action
        // Format messages for OpenRouter format
        const chatHistory = updatedMessages.map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "chat",
            messages: chatHistory,
          }),
        });
        const data = await res.json();
        responseText = data.result || data.error;
      }

      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: responseText,
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      onSaveChat(finalMessages);
      announceToScreenReader("సహాయకుడి నుండి సమాధానం వచ్చింది.");

      // Auto speak response if turned on
      if (settings.autoSpeak) {
        speak(responseText);
        setActiveSpeechId(assistantMsg.id);
      }
    } catch (err: any) {
      console.warn("Chat interface send failed:", err?.message || err);
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: "క్షమించండి, సర్వర్ లోపం కారణంగా సమాధానం ఇవ్వలేకపోయాను. దయచేసి మీ OpenRouter API Key సరిచూసుకోండి.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    
    // Find last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    // Slice messages up to the last user message
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
        speak(responseText);
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
    announceToScreenReader("సమాచారం కాపీ చేయబడింది.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Saarathi AI Response",
          text: text,
        });
      } catch (err: any) {
        console.warn("Share failed:", err?.message || err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("షేర్ చేయడానికి బదులుగా క్లిప్‌బోర్డ్‌కి కాపీ చేయబడింది!");
    }
  };

  const handleVoicePlay = (text: string, id: string) => {
    if (activeSpeechId === id && isSpeaking) {
      stopSpeaking();
      setActiveSpeechId(null);
    } else {
      speak(text, () => setActiveSpeechId(null));
      setActiveSpeechId(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 rounded-3xl border border-slate-800/80 overflow-hidden">
      {/* Messages Window */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-slate-200">ఎలా సహాయం చేయగలను? (How can I help?)</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                మీరు మీ ప్రశ్నను కింద టైప్ చేయవచ్చు లేదా మైక్రోఫోన్ నొక్కి వాయిస్ ద్వారా అడగవచ్చు. ఇంగ్లీష్ లేదా తెలుగు పదాల కలయికతో కూడా అడగవచ్చు.
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
                className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center border ${
                    isUser
                      ? "bg-slate-900 border-slate-800 text-blue-400"
                      : "bg-blue-600 border-blue-500 text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div
                    className={`py-3 px-4 rounded-3xl border shadow-sm ${
                      isUser
                        ? "bg-blue-900/40 border-blue-800/50 text-slate-100 rounded-tr-none"
                        : "bg-slate-900/80 border-slate-800/80 text-slate-100 rounded-tl-none"
                    }`}
                  >
                    {/* Render Image attachment if exists */}
                    {msg.image && (
                      <div className="mb-3 max-w-xs overflow-hidden rounded-xl border border-slate-700/50">
                        <img src={msg.image} alt="Uploaded attachment" className="w-full h-auto object-cover" />
                      </div>
                    )}
                    <div className="text-sm font-normal break-words whitespace-pre-wrap">
                      {isUser ? msg.content : renderMarkdown(msg.content)}
                    </div>
                  </div>

                  {/* Bubble Actions */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5 pl-2">
                      <button
                        onClick={() => handleVoicePlay(msg.content, msg.id)}
                        className={`p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer ${
                          isSpeechActive ? "text-sky-400" : "text-slate-500 hover:text-slate-300"
                        }`}
                        title={isSpeechActive ? "Stop voice" : "Read response"}
                      >
                        {isSpeechActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800/80 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleShare(msg.content)}
                        className="p-1.5 rounded-lg hover:bg-slate-800/80 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        title="Share response"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 mr-auto max-w-[75%]">
            <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="py-3 px-4 rounded-3xl rounded-tl-none bg-slate-900/60 border border-slate-800/80 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded File Preview Banner */}
      {imageFile && (
        <div className="mx-4 mb-2 p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800">
              <img src={imageFile} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs text-slate-400">చిత్రం జతచేయబడింది (Image attached)</span>
          </div>
          <button
            onClick={() => {
              setImageFile(null);
              setImageMimeType(null);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input controls */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* File Upload button */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850 rounded-xl transition-all cursor-pointer"
            title="Attach crop photo, bill or prescription"
            aria-label="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Inline Speech Recognition */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 border rounded-xl transition-all cursor-pointer ${
              isListening
                ? "bg-red-900/50 border-red-800 text-red-400 animate-pulse"
                : "bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Talk to text"
            aria-label={isListening ? "Stop listening" : "Start voice to text"}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "వింటున్నాను..." : "ఇక్కడ మీ సందేశాన్ని టైప్ చేయండి..."}
              className="w-full py-3.5 pl-4 pr-12 rounded-xl bg-slate-950/60 border border-slate-850 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm transition-colors"
            />
            {inputValue && (
              <button
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Big Voice Assistant Launcher */}
          <button
            onClick={onLaunchVoiceMode}
            className="hidden sm:flex items-center gap-1.5 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Mic className="w-4 h-4" />
            వాయిస్ మోడ్
          </button>
        </div>

        {/* Extra Utility Actions */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium px-1">
          <span>Google Gemma 3 via OpenRouter</span>
          {messages.length > 0 && (
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              మళ్ళీ సమాధానం ఇవ్వండి (Regenerate)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
