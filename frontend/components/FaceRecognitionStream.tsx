"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";

interface FaceRecognitionStreamProps {
  sessionId: number;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const FaceRecognitionStream: React.FC<FaceRecognitionStreamProps> = ({
  sessionId,
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const startStreaming = () => {
    if (imgRef.current) {
      // Set the image source to the recognition endpoint
      // This will automatically handle the multipart/x-mixed-replace stream
      imgRef.current.src = `${backendUrl}/recognize/${sessionId}`;
      setIsStreaming(true);
    }
  };

  const stopStreaming = () => {
    if (imgRef.current) {
      // Setting to an empty string stops the stream
      imgRef.current.src = "";
      setIsStreaming(false);
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    // Capture the current value of the ref inside the effect
    const currentImgElement = imgRef.current;

    return () => {
      // Use the captured value in the cleanup function
      if (isStreaming && currentImgElement) {
        currentImgElement.src = "";
      }
    };
  }, [isStreaming]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Face Recognition Stream</h2>
      <div className="flex justify-center">
        {!isStreaming ? (
          <Button
            type="button"
            disabled={isStreaming}
            onClick={startStreaming}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Start Streaming
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!isStreaming}
            onClick={stopStreaming}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            Stop Streaming
          </Button>
        )}
      </div>
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
        {isStreaming ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            alt="Face Recognition Stream"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Stream not active
          </div>
        )}
      </div>

      {isStreaming && (
        <div className="text-sm text-muted-foreground">
          <p>✅ Green box: Recognized person</p>
          <p>🔴 Red box: Unknown person</p>
        </div>
      )}
    </div>
  );
};

export default FaceRecognitionStream;
