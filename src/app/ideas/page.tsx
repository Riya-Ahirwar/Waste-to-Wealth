'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  Clock,
  Gauge,
  Recycle,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Share2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CraftIdea, WasteAnalysisResult } from '@/types/craft';

export default function IdeasPage() {
  const router = useRouter();
  const [wasteImage, setWasteImage] = useState<string | null>(null);
  const [wasteMeta, setWasteMeta] = useState<{ source?: string; title?: string; category?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<WasteAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('saved_crafts');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedIds(new Set(parsed.map((item: CraftIdea) => item.id)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch analysis on mount
  useEffect(() => {
    const img = sessionStorage.getItem('currentWasteImage');
    const metaStr = sessionStorage.getItem('currentWasteMeta');
    const meta = metaStr ? JSON.parse(metaStr) : null;

    setWasteImage(img);
    setWasteMeta(meta);

    if (!img) {
      // Redirect back if no image in session
      router.push('/');
      return;
    }

    const runAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        let base64Data = '';
        let mimeType = 'image/jpeg';

        if (img.startsWith('data:')) {
          const parts = img.split(',');
          base64Data = parts[1];
          mimeType = parts[0].split(';')[0].replace('data:', '');
        }

        const res = await fetch('/api/analyze-waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data || undefined,
            mimeType,
            descriptionHint: meta?.title || meta?.category || '',
          }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          setAnalysis(data.data);
          // Store ideas in sessionStorage for quick craft detail page access
          sessionStorage.setItem('currentIdeas', JSON.stringify(data.data.ideas));
        } else {
          throw new Error(data.error || 'Failed to analyze');
        }
      } catch (err: any) {
        console.error('Analysis error:', err);
        setError('Unable to analyze waste. Please try again or choose another item.');
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [router]);

  // Toggle saving craft to localStorage profile
  const toggleSaveCraft = (idea: CraftIdea) => {
    try {
      const stored = localStorage.getItem('saved_crafts');
      const list: any[] = stored ? JSON.parse(stored) : [];
      const isAlreadySaved = list.some((item) => item.id === idea.id);

      let updatedList;
      if (isAlreadySaved) {
        updatedList = list.filter((item) => item.id !== idea.id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(idea.id);
          return next;
        });
      } else {
        const newItem = {
          ...idea,
          savedAt: new Date().toISOString(),
          status: 'planning',
        };
        updatedList = [newItem, ...list];
        setSavedIds((prev) => new Set(prev).add(idea.id));
      }

      localStorage.setItem('saved_crafts', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  // Open DIY guide and interactive chat for idea
  const handleOpenCraft = (idea: CraftIdea) => {
    // Save current active craft to sessionStorage
    sessionStorage.setItem('activeCraft', JSON.stringify(idea));
    // Also save into saved crafts so it appears in the profile page
    toggleSaveCraft(idea);
    router.push(`/craft/${idea.id}`);
  };

  return (
    <div className="space-y-5 pb-10 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Scan Another</span>
        </Link>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          AI Design Studio
        </span>
      </div>

      {/* Scanned Material Hero Badge */}
      {wasteImage && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-emerald-100 shadow-sm p-3.5 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
            <Image
              src={wasteImage}
              alt="Scanned waste"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Input Material</span>
            </div>
            <h2 className="font-bold text-slate-800 text-sm truncate">
              {analysis?.detectedMaterial || wasteMeta?.title || 'Analyzing Waste...'}
            </h2>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {analysis?.wasteCategory || wasteMeta?.category || 'Evaluating composition'}
            </p>
          </div>
        </div>
      )}

      {/* Demo Mode Notification Banner */}
      {analysis?.isDemoMode && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Running in Demo AI Mode: </span>
            Showing curated DIY project designs. Add your free <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">GEMINI_API_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code> for live real-time multimodal vision!
          </div>
        </div>
      )}

      {/* Loading State with animated spinner and tips */}
      {loading && (
        <div className="bg-white rounded-3xl p-8 border border-emerald-100/80 shadow-sm text-center space-y-4 my-8">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-pulse" />
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-base">Gemini Vision is analyzing...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Examining structural properties, durability, and generating creative upcycling blueprints.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700">
            <Recycle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upcycling saves up to 80% embodied carbon</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="font-bold text-red-800 text-sm">Analysis Interrupted</h3>
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Ideas Grid */}
      {!loading && analysis && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
              <span>Upcycled Creations</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {analysis.ideas.length} Ideas
              </span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Tap to craft</span>
          </div>

          <div className="space-y-4">
            {analysis.ideas.map((idea: CraftIdea) => {
              const isSaved = savedIds.has(idea.id);

              return (
                <div
                  key={idea.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  {/* Visual Image Preview */}
                  <div className="relative w-full h-48 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => handleOpenCraft(idea)}>
                    <Image
                      src={idea.imageUrl}
                      alt={idea.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Top tags */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs">
                        {idea.category}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveCraft(idea);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                          isSaved
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                        aria-label="Save idea"
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom overlay title */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-base leading-tight drop-shadow-sm">
                        {idea.title}
                      </h4>
                      <p className="text-[11px] text-white/90 line-clamp-1 mt-0.5">
                        {idea.summary}
                      </p>
                    </div>
                  </div>

                  {/* Card Content & Badges */}
                  <div className="p-4 space-y-3">
                    {/* Metrics Row */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Gauge className="w-3 h-3 text-emerald-600" />
                        {idea.difficulty}
                      </span>

                      <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {idea.estimatedTime}
                      </span>

                      <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700">
                        <Recycle className="w-3 h-3 text-teal-600" />
                        {idea.divertedWaste}
                      </span>
                    </div>

                    {/* Quick Steps Preview */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        How to make it:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {(idea.quickSteps || []).slice(0, 2).map((step: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="line-clamp-1">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleOpenCraft(idea)}
                      className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Start Making & Chat with AI</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
