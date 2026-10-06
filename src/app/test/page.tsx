'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Clock,
  Gauge,
  Layers,
  FileJson,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { compressImage } from '@/lib/image-utils';
import { SAMPLE_WASTE_ITEMS, SampleWasteItem } from '@/data/sample-waste';

export default function TestAnalyzePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSizeKb, setImageSizeKb] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle image upload from computer
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processed = await compressImage(file, 1024, 1024, 0.85);
      setSelectedImage(processed.dataUrl);
      setImageSizeKb(processed.sizeKb);
      resetResults();
    } catch (err) {
      console.error(err);
    }
  };

  // Select sample waste item
  const handleSelectSample = (sample: SampleWasteItem) => {
    setSelectedImage(sample.imageUrl);
    setImageSizeKb(120);
    resetResults();
  };

  const resetResults = () => {
    setRawJson(null);
    setParsedData(null);
    setErrorMessage(null);
    setResponseStatus(null);
    setResponseTimeMs(null);
  };

  // Submit to /api/analyze
  const handleTestAnalyze = async () => {
    if (!selectedImage || loading) return;

    setLoading(true);
    setErrorMessage(null);
    setRawJson(null);
    setParsedData(null);

    const startTime = performance.now();

    try {
      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (selectedImage.startsWith('data:')) {
        const parts = selectedImage.split(',');
        base64Data = parts[1];
        mimeType = parts[0].split(';')[0].replace('data:', '') || 'image/jpeg';
      } else {
        // If remote sample URL, fetch and convert to base64
        const resp = await fetch(selectedImage);
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
          language,
        }),
      });

      const endTime = performance.now();
      setResponseTimeMs(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const json = await res.json();
      setRawJson(JSON.stringify(json, null, 2));

      if (res.ok && json.success) {
        setParsedData(json);
      } else {
        setErrorMessage(json.error || `HTTP ${res.status}: Failed to analyze`);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTimeMs(Math.round(endTime - startTime));
      setErrorMessage(err.message || 'Network error occurred calling /api/analyze');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!rawJson) return;
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          POST /api/analyze
        </span>
      </div>

      <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-2 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold">
          <span>Gemini Flash API Testbench</span>
        </div>
        <h1 className="text-xl font-black">Analyze Waste Endpoint Tester</h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          Upload any scrap image or pick a preset to trigger <code className="text-emerald-300">/api/analyze</code>. Inspect status codes, latency, and the raw strict JSON output.
        </p>
      </div>

      {/* Language Toggle */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          1. Select Language Field
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['english', 'hindi', 'hinglish'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                language === l
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {l === 'hindi' ? 'हिन्दी (Hindi)' : l}
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload or Pick Sample */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          2. Select Waste Image (Max 4 MB)
        </label>

        {selectedImage ? (
          <div className="space-y-3">
            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              <Image
                src={selectedImage}
                alt="Selected test image"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded-md font-mono">
                ~{imageSizeKb} KB
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="py-2 px-3 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer bg-slate-50/50"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs font-bold">Upload an image file from your device</span>
              <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (under 4 MB)</span>
            </button>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Or pick a sample:</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {SAMPLE_WASTE_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSample(item)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 hover:text-emerald-800 transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trigger Request Button */}
        <button
          type="button"
          onClick={handleTestAnalyze}
          disabled={!selectedImage || loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calling Gemini Flash via /api/analyze...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Send Request to /api/analyze</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {(responseStatus !== null || errorMessage || rawJson) && (
        <div className="space-y-4 animate-fadeIn">
          {/* Status Metrics Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-2xs text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              <span
                className={`font-black px-2 py-0.5 rounded-md ${
                  responseStatus === 200
                    ? 'bg-emerald-100 text-emerald-800'
                    : responseStatus === 429
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {responseStatus ?? 'ERROR'}
              </span>
            </div>

            {responseTimeMs !== null && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{responseTimeMs} ms</span>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Analysis Failed</span>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Parsed Visual Preview */}
          {parsedData?.success && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Valid JSON Response Received</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Language: {language}
                </span>
              </div>

              {/* Items & Materials */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(parsedData.items || []).map((it: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg">
                      📦 {it}
                    </span>
                  ))}
                  {(parsedData.materials || []).map((mat: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-100">
                      🔬 {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Safety Warning */}
              {parsedData.safetyWarning ? (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] uppercase tracking-wider text-amber-800">
                      Safety Warning Detected:
                    </strong>
                    <p>{parsedData.safetyWarning}</p>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  safetyWarning: null (no hazardous materials detected)
                </div>
              )}

              {/* 4 Ideas List */}
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Generated Ideas ({parsedData.ideas?.length || 0}):
                </h3>
                <div className="space-y-2">
                  {(parsedData.ideas || []).map((idea: any, idx: number) => (
                    <div key={idea.id || idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{idx + 1}. {idea.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {idea.difficulty} • {idea.timeMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        <strong>Materials:</strong> {(idea.materialsNeeded || []).join(', ')}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 bg-white p-2 rounded-xl border border-slate-200/60">
                        <strong className="text-slate-700">imagePrompt (English):</strong> {idea.imagePrompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Raw JSON Code Block */}
          {rawJson && (
            <div className="bg-slate-950 text-slate-100 rounded-3xl p-4 shadow-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                  <FileJson className="w-4 h-4" />
                  <span>Raw API Response Body</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-sans font-medium flex items-center gap-1 text-slate-300 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono overflow-x-auto p-2 bg-slate-900/60 rounded-xl leading-relaxed text-emerald-300 max-h-96 overflow-y-auto">
                {rawJson}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
