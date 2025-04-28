/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, CameraIcon, UploadIcon } from "lucide-react";
import Webcam from "react-webcam";
import imageCompression from "browser-image-compression";
import { uploadImage } from "@/lib/actions/image_action";

interface ImageUploadProps {
  onSubmit: (imageUrl: string) => void;
}

export function ImageUpload({ onSubmit }: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState("upload");
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsUploading(true);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      const fileExt = compressedFile.type.split("/")[1];
      const namedFile = new File(
        [compressedFile],
        `upload_${Date.now()}.${fileExt}`,
        { type: compressedFile.type }
      );

      const { imageUrl, error } = await uploadImage(namedFile);
      if (error) {
        setError("Failed to upload image");
        return;
      }
      if (imageUrl) {
        setImage(imageUrl);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const captureWebcam = useCallback(async () => {
    if (!webcamRef.current) return;

    try {
      setError(null);
      setIsUploading(true);

      // Capture image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("Failed to capture image");
        return;
      }

      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // Compress the image
      const compressedFile = await imageCompression(
        new File([blob], "webcam.jpg", { type: "image/jpeg" }),
        {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        }
      );

      const fileExt = compressedFile.type.split("/")[1];
      const namedFile = new File(
        [compressedFile],
        `upload_${Date.now()}.${fileExt}`,
        { type: compressedFile.type }
      );
      const { imageUrl, error } = await uploadImage(namedFile);

      if (error) {
        setError("Failed to capture or upload image");
        return;
      }

      if (imageUrl) {
        setImage(imageUrl);
      }
    } catch (err) {
      console.error("Error capturing/uploading image:", err);
      setError("Failed to capture or upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [webcamRef]);

  function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (image) {
      onSubmit(image);
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile Image</h2>
        <p className="text-muted-foreground">
          Add a profile image for the admin account.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="webcam">
            <CameraIcon className="mr-2 h-4 w-4" />
            Webcam
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                {image ? (
                  <div className="relative h-40 w-40 overflow-hidden rounded-full">
                    <img
                      src={image || "/placeholder.svg"}
                      alt="Uploaded profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    onClick={triggerFileInput}
                    className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground bg-muted hover:bg-muted/80"
                  >
                    <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload
                    </span>
                  </div>
                )}

                <input
                  title="image upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {!image && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Select Image"}
                  </Button>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}

                {image && (
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setImage(null)}
                      disabled={isUploading}
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isUploading}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webcam" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                {image ? (
                  <div className="relative h-40 w-40 overflow-hidden rounded-full">
                    <img
                      src={image || "/placeholder-image.jpg"}
                      alt="Captured profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 800,
                        height: 600,
                        facingMode: "user",
                      }}
                      className="h-[240px] w-[320px]"
                    />
                  </div>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}

                {!image ? (
                  <Button onClick={captureWebcam} disabled={isUploading}>
                    {isUploading ? "Processing..." : "Take Photo"}
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setImage(null)}
                      disabled={isUploading}
                    >
                      Retake
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isUploading}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
