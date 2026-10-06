'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Gauge,
  Package,
  BookmarkCheck,
  Bookmark,
  Loader2,
  HelpCircle,
  Leaf,
} from 'lucide-react';
import { IdeaItem, SavedIdea, CraftStatus } from '@/types/craft';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params?.id as string;
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [idea, setIdea] = useState<(IdeaItem & { originalItems?: string[] }) | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedStatus, setSavedStatus] = useState<CraftStatus>('Planned');

  // Load idea details on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('selectedIdea');
      if (stored) {
        const parsed = JSON.parse(stored);
        setIdea(parsed);
        checkSavedStatus(parsed.id);
        initChat(parsed.title);
        return;
      }

      // Check saved items in localStorage
      const localSaved = localStorage.getItem('saved_ideas');
      if (localSaved) {
        const list: SavedIdea[] = JSON.parse(localSaved);
        const match = list.find((it) => it.id === ideaId);
        if (match) {
          setIdea({
            id: match.id,
            title: match.title,
            imageUrl: match.image,
            materialsNeeded: match.materialsNeeded,
            timeMinutes: match.timeMinutes || 20,
            difficulty: match.difficulty || 'Easy',
            imagePrompt: '',
            originalItems: match.originalItems || [],
          });
          setIsSaved(true);
          setSavedStatus(match.status);
          initChat(match.title);
          return;
        }
      }

      router.push('/');
    } catch (e) {
      console.error(e);
      router.push('/');
    }
  }, [ideaId, router]);

  // Check if item is already saved in profile
  const checkSavedStatus = (id: string) => {
    try {
      const localSaved = localStorage.getItem('saved_ideas');
      if (localSaved) {
        const list: SavedIdea[] = JSON.parse(localSaved);
        const match = list.find((it) => it.id === id);
        if (match) {
          setIsSaved(true);
          setSavedStatus(match.status);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Welcome message
  const initChat = (craftTitle: string) => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hi! I'm here to guide you step-by-step through making **${craftTitle}**.\nAsk me anything: missing tools, cutting safely, or Hinglish tips!`,
      },
    ]);
  };

  // Scroll to bottom on message update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // "I want to make this" button handler
  const handleWantToMakeThis = () => {
    if (!idea) return;

    try {
      const localSaved = localStorage.getItem('saved_ideas');
      const list: SavedIdea[] = localSaved ? JSON.parse(localSaved) : [];

      const exists = list.some((it) => it.id === idea.id);

      if (!exists) {
        const newSavedItem: SavedIdea = {
          id: idea.id,
          title: idea.title,
          image: idea.imageUrl || '/icons/icon.svg',
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          status: 'Planned',
          materialsNeeded: idea.materialsNeeded,
          timeMinutes: idea.timeMinutes,
          difficulty: idea.difficulty,
          originalItems: idea.originalItems || [],
        };

        const updated = [newSavedItem, ...list];
        localStorage.setItem('saved_ideas', JSON.stringify(updated));
        setIsSaved(true);
        setSavedStatus('Planned');
      } else {
        // Toggle saved off
        const updated = list.filter((it) => it.id !== idea.id);
        localStorage.setItem('saved_ideas', JSON.stringify(updated));
        setIsSaved(false);
      }
    } catch (e) {
      console.error('Error saving idea to profile:', e);
    }
  };

  // Stream AI response
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || !idea || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsStreaming(true);

    const assistantMsgId = `ai-${Date.now()}`;
    // Add empty placeholder for streaming text
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '' },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          materialsNeeded: idea.materialsNeeded,
          originalItems: idea.originalItems || [],
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          query,
        }),
      });

      if (!res.ok) throw new Error('Chat failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
            )
          );
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: 'Could not connect to the AI guide. Please check your connection and try again.' }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading craft details...</p>
      </div>
    );
  }

  const quickQuestions = [
    'How do I cut this safely?',
    'Can I do this without glue?',
    'Step-by-step guidance please',
    'Bina glue ke kaise banayein?',
  ];

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ideas</span>
        </Link>

        {isSaved && (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Saved in Profile</span>
          </span>
        )}
      </div>

      {/* Large Product Image */}
      <div className="relative w-full h-56 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/90 shadow-md">
        {idea.imageUrl ? (
          <Image
            src={idea.imageUrl}
            alt={idea.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-6 text-center text-emerald-200">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-300/80">AI Craft Blueprint</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              {idea.difficulty}
            </span>
            <span className="text-xs text-white/90 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-300" />
              <span>{idea.timeMinutes} mins</span>
            </span>
          </div>
          <h1 className="text-lg font-extrabold leading-tight drop-shadow-sm">
            {idea.title}
          </h1>
        </div>
      </div>

      {/* Materials Needed Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
        <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          <span>Materials Needed</span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {idea.materialsNeeded.map((mat, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100"
            >
              {mat}
            </span>
          ))}
        </div>
      </div>

      {/* "I want to make this" CTA Button */}
      <button
        type="button"
        onClick={handleWantToMakeThis}
        className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 ${
          isSaved
            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
            : 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-emerald-600/30'
        }`}
      >
        {isSaved ? (
          <>
            <BookmarkCheck className="w-5 h-5 text-emerald-700" />
            <span>Saved to Profile (Planned)</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>I want to make this</span>
          </>
        )}
      </button>

      {/* Interactive Chat Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
              AI
            </div>
            <span className="font-bold text-xs text-slate-800">DIY Assistant Chat</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Hinglish & English</span>
        </div>

        {/* Messages Container */}
        <div
          ref={chatScrollRef}
          className="p-4 space-y-3 min-h-[220px] max-h-[320px] overflow-y-auto bg-slate-50/50"
        >
          {messages.map((msg) => {
            const isAi = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isAi ? 'items-start' : 'items-end flex-row-reverse'}`}
              >
                {isAi && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-xs mt-0.5">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isAi
                      ? 'bg-white text-slate-800 border border-slate-200/70 shadow-2xs whitespace-pre-line'
                      : 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                  }`}
                >
                  {msg.content || (
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      <span>Typing...</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Question Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-3 py-2 bg-white border-t border-slate-100">
          {quickQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="flex-shrink-0 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-medium px-3 py-1 rounded-full transition-colors cursor-pointer border border-slate-200/60"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything (e.g. 'Can I do this without glue?')..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isStreaming}
            className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
