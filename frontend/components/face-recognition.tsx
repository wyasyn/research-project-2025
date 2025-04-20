"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;

interface FaceRecognitionProps {
  sessionId: number;
  onComplete: () => void;
  cameraIndex: number;
}

export function FaceRecognition({
  sessionId,
  onComplete,
  cameraIndex,
}: FaceRecognitionProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStreamReady, setIsStreamReady] = useState(false);

  // Memoize the stream URL to avoid unnecessary recalculations
  const streamUrl = useMemo(() => {
    return `${serverApi}/recognize/${sessionId}?camera=${cameraIndex}`;
  }, [sessionId, cameraIndex]);

  useEffect(() => {
    if (imgRef.current) {
      const imgElement = imgRef.current;
      console.log(`Stream URL: ${streamUrl}`);

      // Set the image source for the stream
      imgElement.src = streamUrl;

      imgElement.onload = () => {
        setLoading(false);
        setIsStreamReady(true);
      };

      imgElement.onerror = (event) => {
        console.error("Error loading image:", event);
        setError(
          "Failed to connect to the face recognition stream. Please try again."
        );
        setLoading(false);
      };

      return () => {
        imgElement.src = "";
      };
    }
  }, [streamUrl, onComplete]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      <div className="aspect-video bg-black rounded-md overflow-hidden">
        <img
          ref={imgRef}
          alt="Face recognition stream"
          className="w-full h-full object-cover"
        />
      </div>

      {isStreamReady && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Face recognition is active. Stand in front of the camera to be marked
          present.
        </p>
      )}
      {!isStreamReady && !loading && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          The stream failed to load. Please try again or check your connection.
        </p>
      )}
    </div>
  );
}
