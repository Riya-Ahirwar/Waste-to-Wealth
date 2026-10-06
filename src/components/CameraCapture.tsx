'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, Image as ImageIcon, AlertCircle, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import { compressImage, ProcessedImage } from '@/lib/image-utils';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onImageConfirmed: (image: ProcessedImage) => void;
}

type Stage = 'explainer' | 'live' | 'preview' | 'denied';

export default function CameraCapture({ isOpen, onClose, onImageConfirmed }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('explainer');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Stop camera stream cleanly
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setStage('explainer');
      setCapturedBlob(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setErrorMessage(null);
    }
  }, [isOpen, stopStream]);

  // Start live rear camera
  const startCamera = async () => {
    stopStream();
    setErrorMessage(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage('Camera access is not supported by your current browser.');
      setStage('denied');
      return;
    }

    try {
      // Prioritize rear camera (environment)
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to any available video camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      setStage('live');

      // Attach stream to video tag after state render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      console.warn('Camera permission denied or device error:', err);
      setErrorMessage('Camera permission was denied. Please allow camera permissions in your browser or choose a photo from your gallery.');
      setStage('denied');
    }
  };

  // Capture photo snapshot from the video stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopStream();
          setCapturedBlob(blob);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setStage('preview');
        }
      },
      'image/jpeg',
      0.9
    );
  };

  // Confirm photo: Compress to under 1MB and return
  const handleUseThisPhoto = async () => {
    if (!capturedBlob || isProcessing) return;

    try {
      setIsProcessing(true);
      // compressImage scales to max 1024x1024, JPEG quality 0.82 ensuring payload is well under 1 MB
      const processed = await compressImage(capturedBlob, 1024, 1024, 0.82);
      onImageConfirmed(processed);
      onClose();
    } catch (err) {
      console.error('Error compressing image:', err);
      setErrorMessage('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Retake photo: return to live camera
  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCapturedBlob(null);
    startCamera();
  };

  // Handle fallback file upload from gallery
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const processed = await compressImage(file, 1024, 1024, 0.82);
      stopStream();
      onImageConfirmed(processed);
      onClose();
    } catch (err) {
      console.error('Failed to process gallery file:', err);
      setErrorMessage('Failed to read image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 backdrop-blur-md animate-fadeIn">
      {/* Hidden file input for gallery picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryUpload}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 pt-2">
        <button
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full border border-white/10">
          {stage === 'explainer' && 'Camera Permission'}
          {stage === 'live' && 'Rear Camera Live'}
          {stage === 'preview' && 'Review Photo'}
          {stage === 'denied' && 'Permission Required'}
        </span>

        <div className="w-10" />
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden rounded-3xl bg-slate-900 border border-white/10">
        {/* 1. FRIENDLY CAMERA PERMISSION EXPLANATION SCREEN */}
        {stage === 'explainer' && (
          <div className="p-6 text-center text-white max-w-xs space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-white">
                Camera Access Needed
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Waste to Wealth needs your rear camera to photograph scrap materials (plastic, glass, cardboard) so AI can detect their structure and suggest DIY projects.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Photos are processed securely & never shared</span>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Allow Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload from Gallery instead</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. LIVE CAMERA STREAM */}
        {stage === 'live' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder target */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-dashed border-emerald-400/80 rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>
          </div>
        )}

        {/* 3. PREVIEW WITH RETAKE & USE THIS PHOTO */}
        {stage === 'preview' && previewUrl && (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <img
              src={previewUrl}
              alt="Snapshot preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* 4. PERMISSION DENIED OR UNSUPPORTED FALLBACK */}
        {stage === 'denied' && (
          <div className="p-6 text-center text-white max-w-xs space-y-4 animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white">
                Camera Not Accessible
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {errorMessage || 'Camera access was blocked or is unsupported. You can still proceed by uploading a photo directly from your gallery.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Choose Photo from Gallery</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="py-2 z-10 max-w-sm mx-auto w-full">
        {stage === 'live' && (
          <div className="flex items-center justify-around">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-1">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px]">Gallery</span>
            </button>

            {/* Shutter Capture Button */}
            <button
              type="button"
              onClick={captureSnapshot}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-all p-1"
              aria-label="Capture photo"
            >
              <div className="w-full h-full rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow-lg">
                <Camera className="w-8 h-8" />
              </div>
            </button>

            <div className="w-11" />
          </div>
        )}

        {stage === 'preview' && (
          <div className="grid grid-cols-2 gap-3 px-2">
            <button
              type="button"
              onClick={handleRetake}
              className="py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake</span>
            </button>

            <button
              type="button"
              onClick={handleUseThisPhoto}
              disabled={isProcessing}
              className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'Compressing...' : 'Use this photo'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
