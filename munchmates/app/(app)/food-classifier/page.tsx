'use client';

import React, { useEffect, useRef, useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { Camera, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

type MobilenetPrediction = {
  className: string;
  probability: number;
};

const FoodClassifierPage = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<MobilenetPrediction[]>([]);
  const [suggestedLabel, setSuggestedLabel] = useState<string | null>(null);
  const [confirmedLabel, setConfirmedLabel] = useState<string | null>(null);

  const [useCamera, setUseCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const modelRef = useRef<any>(null);

  // Load MobileNet once (ImageNet model)
  const loadModel = async () => {
    if (modelRef.current || modelStatus === 'loading') return;

    try {
      setModelStatus('loading');
      const mobilenet = await import('@tensorflow-models/mobilenet');
      await import('@tensorflow/tfjs'); // required backend
      const model = await mobilenet.load();
      modelRef.current = model;
      setModelStatus('ready');
    } catch (e) {
      console.error(e);
      setError('Failed to load MobileNet model.');
      setModelStatus('error');
    }
  };

  // Setup / teardown camera stream
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error(e);
        setError('Unable to access camera.');
        setUseCamera(false);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };

    if (useCamera) startCamera();
    else stopCamera();

    return () => stopCamera();
  }, [useCamera]);

  const reset = () => {
    setError(null);
    setPredictions([]);
    setSuggestedLabel(null);
    setConfirmedLabel(null);
  };

  // File upload
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    reset();

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Capture from camera
  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;

    reset();

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setImageSrc(canvas.toDataURL('image/jpeg'));
  };

  // Run MobileNet prediction when image loads
  const handleImageLoaded = async () => {
    if (!imageRef.current) return;

    await loadModel();
    if (!modelRef.current) return;

    try {
      setIsClassifying(true);

      const preds = await modelRef.current.classify(imageRef.current, 5);
      setPredictions(preds);

      if (preds.length > 0) {
        setSuggestedLabel(preds[0].className);
      }
    } catch (e) {
      console.error(e);
      setError('Classification error.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleConfirm = () => {
    if (suggestedLabel) setConfirmedLabel(suggestedLabel);
  };

  return (
    <RequireAuth>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex min-h-screen flex-col flex-1">
          <AppHeader title={''} />

          <main className="flex-1 bg-background px-4 py-4 md:px-8 md:py-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:flex-row">

              {/* Left column (Upload + Camera + Preview) */}
              <div className="flex flex-col gap-4 w-full lg:w-1/2">

                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Image Classifier</span>
                      <span className="text-xs text-muted-foreground">
                        {modelStatus === 'idle' && 'Model not loaded'}
                        {modelStatus === 'loading' && 'Loading model…'}
                        {modelStatus === 'ready' && 'Model ready'}
                        {modelStatus === 'error' && 'Model failed'}
                      </span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">

                    {/* Toggle Camera */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Image Source</span>
                      <Button
                        size="sm"
                        variant={useCamera ? 'default' : 'outline'}
                        onClick={() => setUseCamera(prev => !prev)}
                      >
                        {useCamera ? (
                          <>
                            <Upload className="mr-2 h-4 w-4" /> Use file upload
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" /> Use camera
                          </>
                        )}
                      </Button>
                    </div>

                    {/* File upload */}
                    {!useCamera && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Upload any image — MobileNet will classify it locally.
                        </p>
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                      </div>
                    )}

                    {/* Camera */}
                    {useCamera && (
                      <div className="space-y-3">
                        <div className="rounded-md overflow-hidden bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full aspect-video object-cover"
                          />
                        </div>
                        <Button className="w-full" onClick={handleCaptureFromCamera}>
                          <Camera className="mr-2 h-4 w-4" />
                          Capture Image
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {imageSrc && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4 items-start">

                      <img
                        src={imageSrc}
                        alt="preview"
                        className="w-32 h-32 rounded-md border object-cover"
                      />

                      <img
                        ref={imageRef}
                        src={imageSrc}
                        alt="classify"
                        className="hidden"
                        onLoad={handleImageLoaded}
                      />

                      <div className="text-xs text-muted-foreground">
                        {isClassifying ? 'Classifying…' : 'Loaded and ready.'}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right column (Predictions + Confirm) */}
              <div className="flex flex-col w-full lg:w-1/2 gap-4">

                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="text-sm">Classification Results</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">

                    {predictions.length > 0 && (
                      <ul className="space-y-1 text-xs">
                        {predictions.map((p, i) => (
                          <li
                            key={i}
                            className="flex justify-between px-2 py-1 border rounded-md"
                          >
                            <span>{p.className}</span>
                            <span className="text-muted-foreground">
                              {(p.probability * 100).toFixed(2)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {suggestedLabel && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Edit or confirm:</p>
                        <Input
                          value={suggestedLabel}
                          onChange={e => setSuggestedLabel(e.target.value)}
                        />
                      </div>
                    )}

                    <Button
                      disabled={!suggestedLabel}
                      size="sm"
                      onClick={handleConfirm}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm
                    </Button>

                    {confirmedLabel && (
                      <p className="text-xs text-muted-foreground">
                        Confirmed: <span className="font-semibold">{confirmedLabel}</span>
                      </p>
                    )}

                    {!imageSrc && (
                      <p className="text-xs text-muted-foreground">
                        Upload or capture an image to begin.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {error && (
                  <Card className="border-destructive bg-destructive/10">
                    <CardContent className="flex items-start gap-2 py-3 text-xs text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

            </div>
          </main>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
};

export default FoodClassifierPage;
