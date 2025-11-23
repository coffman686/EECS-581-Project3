'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, AlertCircle } from 'lucide-react';

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

interface ImageClassificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onResult: (label: string) => void;
}

function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(/[\s,_]+/) // handle spaces, underscores, commas
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export default function ImageClassificationDialog({
    open,
    onOpenChange,
    onResult,
}: ImageClassificationDialogProps) {
    const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
    const [isClassifying, setIsClassifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [suggestedLabel, setSuggestedLabel] = useState<string>('');
    const [useCamera, setUseCamera] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const modelRef = useRef<any>(null);

    // Load MobileNet once
    const loadModel = async () => {
        if (modelRef.current || modelStatus === 'loading') return;
        try {
            setModelStatus('loading');
            const mobilenet = await import('@tensorflow-models/mobilenet');
            await import('@tensorflow/tfjs');
            const model = await mobilenet.load();
            modelRef.current = model;
            setModelStatus('ready');
        } catch (e) {
            console.error('Error loading MobileNet:', e);
            setModelStatus('error');
            setError('Failed to load image classification model.');
        }
    };

    // Camera handling
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (e) {
                console.error('Camera error:', e);
                setError('Could not access camera. Check browser permissions.');
                setUseCamera(false);
            }
        };

        const stopCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
        };

        if (open && useCamera) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [open, useCamera]);

    // Reset when dialog closes
    useEffect(() => {
        if (!open) {
            setError(null);
            setImageSrc(null);
            setSuggestedLabel('');
            setUseCamera(false);
        }
    }, [open]);

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        setSuggestedLabel('');
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCaptureFromCamera = () => {
        if (!videoRef.current) return;

        setError(null);
        setSuggestedLabel('');

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL('image/jpeg', 0.9));
    };

    const handleImageLoaded = async () => {
        if (!imageRef.current) return;
        await loadModel();
        if (!modelRef.current) return;

        try {
            setIsClassifying(true);
            setError(null);

            const preds = await modelRef.current.classify(imageRef.current, 1);
            const best = preds[0];
                if (best) {
                const pretty = toTitleCase(best.className);
                setSuggestedLabel(pretty);
            } else {
                setSuggestedLabel('');
            }
        } catch (e) {
            console.error('Classification error:', e);
            setError('Failed to classify image.');
        } finally {
            setIsClassifying(false);
        }
    };

    const handleUseResult = () => {
        if (!suggestedLabel.trim()) return;
        onResult(suggestedLabel.trim());
        onOpenChange(false);
    };

    const modelStatusLabel =
        modelStatus === 'idle'
            ? 'Model not loaded'
            : modelStatus === 'loading'
            ? 'Loading model...'
            : modelStatus === 'ready'
            ? 'Model ready'
            : 'Model error';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add via image</DialogTitle>
                    <DialogDescription>
                        Upload an image or use your camera. The app will try to classify it and fill the item
                        name for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Image source</span>
                        <Button
                            type="button"
                            size="sm"
                            variant={useCamera ? 'default' : 'outline'}
                            onClick={() => setUseCamera((prev) => !prev)}
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

                    {/* Upload mode */}
                    {!useCamera && (
                        <div className="space-y-2">
                            <Button type="button" variant="outline" asChild>
                                <label className="cursor-pointer inline-flex items-center">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose file
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </Button>
                        </div>
                    )}

                    {/* Camera mode */}
                    {useCamera && (
                        <div className="space-y-2">
                            <div className="overflow-hidden rounded-md bg-black">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full aspect-video object-cover"
                                />
                            </div>
                            <Button type="button" className="w-full" onClick={handleCaptureFromCamera}>
                                <Camera className="mr-2 h-4 w-4" />
                                Capture photo
                            </Button>
                        </div>
                    )}

                    {/* Preview + hidden img for classification */}
                    {imageSrc && (
                        <div className="flex gap-3 items-start">
                            <img
                                src={imageSrc}
                                alt="Preview"
                                className="h-20 w-20 rounded-md border object-cover"
                            />
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="For classification"
                                className="hidden"
                                onLoad={handleImageLoaded}
                            />
                            <div className="flex-1 text-xs text-muted-foreground">
                                <p>{modelStatusLabel}</p>
                                {isClassifying && <p className="mt-1">Classifying image...</p>}
                            </div>
                        </div>
                    )}

                    {/* Confirmation field for the top prediction */}
                    {imageSrc && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Edit the item name before using it, if needed:
                            </p>
                            <Input
                                placeholder="Detected item name"
                                value={suggestedLabel}
                                onChange={(e) => setSuggestedLabel(e.target.value)}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
                            <AlertCircle className="mt-[2px] h-4 w-4" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button disabled={!suggestedLabel.trim()} onClick={handleUseResult}>
                        Use this name
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
