'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Clock,
  ArrowRight,
  Globe,
  CheckCircle2,
  Loader2,
  Wand2,
  Leaf,
  Info,
} from 'lucide-react';
import CameraCapture from '@/components/CameraCapture';
import { ProcessedImage, compressImage } from '@/lib/image-utils';
import { AnalyzeResponse, IdeaItem, LanguageOption } from '@/types/craft';
import { SAMPLE_WASTE_ITEMS, SampleWasteItem } from '@/data/sample-waste';

interface ImageCardState {
  url?: string;
  loading: boolean;
  error: boolean;
  errorMessage?: string;
}

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [language, setLanguage] = useState<LanguageOption>('english');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // In-memory cache for AI-generated images per idea ID
  const [imageCache, setImageCache] = useState<Record<string, ImageCardState>>({});
  const [hasQuotaExceeded, setHasQuotaExceeded] = useState(false);

  // When user selects or uploads an image, show preview and button first
  const handleNewImageSelected = (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setAnalysisResult(null);
    setAnalysisError(null);
    setImageCache({});
    setHasQuotaExceeded(false);
  };

  // Run analysis when user explicitly taps "Generate DIY Ideas & Images"
  const handleGenerateClick = () => {
    if (!selectedImage) return;
    runAnalysis(selectedImage, language);
  };

  // Call /api/analyze and trigger image generation
  const runAnalysis = async (imgDataUrl: string, lang: LanguageOption) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setHasQuotaExceeded(false);

    try {
      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (imgDataUrl.startsWith('data:')) {
        const parts = imgDataUrl.split(',');
        base64Data = parts[1];
        mimeType = parts[0].split(';')[0].replace('data:', '');
      } else {
        // Fetch remote sample image and convert to base64
        const resp = await fetch(imgDataUrl);
        const blob = await resp.blob();
        mimeType = blob.type || 'image/jpeg';
        const reader = new FileReader();
        base64Data = await new Promise((resolve) => {
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          language: lang,
        }),
      });

      const data = await res.json();
      if (data.success && data.ideas && data.ideas.length > 0) {
        setAnalysisResult(data);
        generateImagesSequentially(data.ideas);
      } else {
        throw new Error(data.error || 'Failed to analyze waste');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'Unable to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate the 4 images one by one (sequentially, not all at once) to avoid rate limits
  const generateImagesSequentially = async (ideas: IdeaItem[]) => {
    // Pre-initialize loading skeleton for ideas that don't have a cached URL
    const initialStates: Record<string, ImageCardState> = {};
    ideas.forEach((idea) => {
      if (!imageCache[idea.id]?.url) {
        initialStates[idea.id] = { loading: true, error: false };
      }
    });
    setImageCache((prev) => ({ ...prev, ...initialStates }));

    // Process one by one to avoid rate limits
    for (const idea of ideas) {
      if (imageCache[idea.id]?.url) continue;
      await fetchSingleImage(idea);
    }
  };

  // Generate AI image for a single idea from its own imagePrompt
  const fetchSingleImage = async (idea: IdeaItem) => {
    // Show loading skeleton on this specific card
    setImageCache((prev) => ({
      ...prev,
      [idea.id]: { loading: true, error: false, url: undefined },
    }));

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePrompt: idea.imagePrompt,
          ideaId: idea.id,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.imageUrl) {
        setImageCache((prev) => ({
          ...prev,
          [idea.id]: {
            url: data.imageUrl,
            loading: false,
            error: false,
          },
        }));
      } else {
        if (data.isQuotaExceeded || res.status === 429) {
          setHasQuotaExceeded(true);
        }
        setImageCache((prev) => ({
          ...prev,
          [idea.id]: {
            url: undefined,
            loading: false,
            error: true,
            errorMessage: data.error || 'Generation unavailable',
          },
        }));
      }
    } catch (err: any) {
      setImageCache((prev) => ({
        ...prev,
        [idea.id]: {
          url: undefined,
          loading: false,
          error: true,
          errorMessage: err?.message || 'Network error',
        },
      }));
    }
  };

  // Handle gallery file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processed = await compressImage(file, 1024, 1024, 0.82);
      handleNewImageSelected(processed.dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle sample waste item pick
  const handleSelectSample = (sample: SampleWasteItem) => {
    handleNewImageSelected(sample.imageUrl);
  };

  // Retake / Change image
  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setImageCache({});
    setHasQuotaExceeded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Switch language
  const handleLanguageChange = (newLang: LanguageOption) => {
    setLanguage(newLang);
    if (selectedImage && analysisResult) {
      runAnalysis(selectedImage, newLang);
    }
  };

  // If image fails to render in browser, show neutral placeholder + Retry (never stock photo)
  const handleImageError = (ideaId: string) => {
    setImageCache((prev) => ({
      ...prev,
      [ideaId]: {
        url: undefined,
        loading: false,
        error: true,
      },
    }));
  };

  // Navigate to Product / Chat page for selected idea
  const handleSelectIdea = (idea: IdeaItem) => {
    const cachedImage = imageCache[idea.id]?.url || undefined;
    const ideaWithImage = {
      ...idea,
      imageUrl: cachedImage,
      originalItems: analysisResult?.items || [],
    };
    sessionStorage.setItem('selectedIdea', JSON.stringify(ideaWithImage));
    router.push(`/craft/${idea.id}`);
  };

  return (
    <div className="space-y-5 pb-8 animate-fadeIn">
      {/* Hidden file input for gallery picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Live Camera Modal with Permission Explainer */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onImageConfirmed={(processed: ProcessedImage) => handleNewImageSelected(processed.dataUrl)}
      />

      {/* Language Toggle Bar */}
      <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>Language:</span>
        </div>

        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleLanguageChange('english')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'english'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('hindi')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'hindi'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('hinglish')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'hinglish'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      {/* Upload & Camera Buttons (When no image is selected yet) */}
      {!selectedImage && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Camera className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-extrabold text-slate-800 text-lg">
              {language === 'hindi'
                ? 'कचरा या बेकार वस्तु को स्कैन करें'
                : language === 'hinglish'
                ? 'Scrap Material Scan Karein'
                : 'Scan or Upload Waste'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {language === 'hindi'
                ? 'प्लास्टिक, कांच, गत्ते या धातु की तस्वीर लें और एआई से क्राफ्ट आइडिया पाएं।'
                : language === 'hinglish'
                ? 'Plastic, cardboard ya glass ki photo lein aur generate karein AI DIY ideas.'
                : 'Take a photo or upload from gallery, then generate 4 AI DIY craft ideas with pictures.'}
            </p>
          </div>

          <div className="w-full space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo (Live Camera)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload from Gallery</span>
            </button>
          </div>
        </div>
      )}

      {/* Selected Image Banner & Explicit Generate Button */}
      {selectedImage && (
        <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Scanned Waste Photo</span>
            </span>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake / Change</span>
            </button>
          </div>

          <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <Image
              src={selectedImage}
              alt="Uploaded waste photo"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Explicit Generate Button (Shows after photo selection) */}
          {!analysisResult && (
            <button
              type="button"
              onClick={handleGenerateClick}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing waste & creating craft blueprints...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-yellow-300" />
                  <span>
                    {language === 'hindi'
                      ? '✨ क्राफ्ट आइडिया व चित्र बनाएं'
                      : language === 'hinglish'
                      ? '✨ Generate Upcycled Ideas & Images'
                      : '✨ Generate 4 DIY Ideas & Images'}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Detected Items & Materials */}
          {analysisResult && (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.items.map((it, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg"
                  >
                    📦 {it}
                  </span>
                ))}
                {analysisResult.materials.map((mat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-100"
                  >
                    🔬 {mat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hazardous Materials Safety Warning */}
      {analysisResult?.safetyWarning && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-xs animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-black block uppercase tracking-wider text-amber-800 mb-0.5">
              Safety Caution
            </span>
            <p>{analysisResult.safetyWarning}</p>
          </div>
        </div>
      )}

      {/* Quota Limit Notice when Daily Free Limit is reached */}
      {hasQuotaExceeded && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-3 text-amber-900 shadow-2xs animate-fadeIn">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-800 block text-[11px]">
              Daily AI Image Limit Reached (429)
            </span>
            <p className="text-[11px] leading-relaxed text-amber-700">
              The free daily AI image allowance has reached its limit for today and will reset tomorrow. Your full DIY craft blueprints, materials needed, and AI step-by-step chat guide remain 100% available below!
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton while Analyzing */}
      {isAnalyzing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-800 text-sm">
              Analyzing waste with Gemini vision...
            </h3>
            <span className="text-xs text-emerald-600 font-semibold animate-pulse">
              Creating 4 craft blueprints
            </span>
          </div>

          {/* 4 Card Skeleton Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-2 animate-pulse"
              >
                <div className="w-full h-28 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                <div className="h-3 bg-slate-100 rounded-md w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {analysisError && !isAnalyzing && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-2">
          <p className="text-xs text-red-600 font-medium">{analysisError}</p>
          <button
            type="button"
            onClick={handleGenerateClick}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* 4-CARD IDEAS GRID ON HOME */}
      {!isAnalyzing && analysisResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>4 Upcycling Ideas</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Tap to build</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {analysisResult.ideas.map((idea) => {
              const imgState = imageCache[idea.id] || { loading: false, error: false };

              return (
                <div
                  key={idea.id}
                  onClick={() => handleSelectIdea(idea)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
                >
                  {/* Card Visual Header: AI Image / Loading Skeleton / Neutral Placeholder */}
                  {imgState.loading ? (
                    /* Loading Skeleton while generating this specific card */
                    <div className="relative w-full h-32 bg-slate-100/90 animate-pulse flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400">
                      <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                      <span className="text-[10px] font-semibold text-slate-500 animate-pulse">
                        Generating AI image...
                      </span>
                      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/40 text-white text-[9px] font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{idea.timeMinutes}m</span>
                      </div>
                    </div>
                  ) : imgState.url ? (
                    /* Real AI Generated Image */
                    <div className="relative w-full h-32 bg-slate-100 overflow-hidden">
                      <Image
                        src={imgState.url}
                        alt={idea.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                        onError={() => handleImageError(idea.id)}
                      />
                      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{idea.timeMinutes}m</span>
                      </div>
                    </div>
                  ) : (
                    /* Neutral Placeholder: Leaf icon + title + Retry button (NEVER unrelated stock photo) */
                    <div className="relative w-full h-32 bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/50 border-b border-slate-100 flex flex-col items-center justify-center p-2.5 text-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 shadow-2xs">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 line-clamp-1 max-w-[95%]">
                        {idea.title}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchSingleImage(idea);
                        }}
                        className="mt-1.5 px-2 py-0.5 bg-white hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200/90 shadow-2xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Retry image</span>
                      </button>
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-200/70 text-slate-600 text-[8px] font-bold flex items-center gap-0.5">
                        <Clock className="w-2 h-2" />
                        <span>{idea.timeMinutes}m</span>
                      </div>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-800 mb-1">
                        {idea.difficulty}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {idea.title}
                      </h4>
                    </div>

                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-600 font-bold">
                      <span>View Craft</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Waste Items for Quick Testing */}
      {!selectedImage && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Or test instantly with scrap samples:
            </h4>
            <span className="text-[10px] text-emerald-600 font-medium">Quick Pick</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {SAMPLE_WASTE_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSample(item)}
                className="flex-shrink-0 w-28 bg-white p-2 rounded-2xl border border-slate-200/80 hover:border-emerald-400 shadow-2xs transition-all text-left cursor-pointer group"
              >
                <div className="relative w-full h-18 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-black/50 text-[8px] font-bold text-white">
                    {item.category}
                  </div>
                </div>
                <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-snug">
                  {item.name}
                </h5>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
