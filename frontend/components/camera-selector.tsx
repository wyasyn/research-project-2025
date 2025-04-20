import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

const CAMERA_STORAGE_KEY = "preferred_camera_index";

export function CameraSelector({
  onSelect,
}: {
  onSelect: (deviceId: string, index: number) => void;
}) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const videoDevices = useMemo(
    () => devices.filter((d) => d.kind === "videoinput"),
    [devices]
  );

  useEffect(() => {
    async function fetchDevices() {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(mediaDevices);
      } catch (err) {
        console.error("Error fetching cameras:", err);
        setError("Unable to access camera devices. Check permissions.");
      }
    }

    fetchDevices();
    navigator.mediaDevices.addEventListener("devicechange", fetchDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", fetchDevices);
    };
  }, []);

  useEffect(() => {
    if (videoDevices.length === 0) return;

    const storedIndex = parseInt(
      localStorage.getItem(CAMERA_STORAGE_KEY) || "0",
      10
    );

    const validIndex =
      storedIndex >= 0 && storedIndex < videoDevices.length ? storedIndex : 0;

    if (validIndex !== storedIndex) {
      toast(
        "Previously selected camera not found. Falling back to the first camera.",
        { icon: "⚠️" }
      );
    }

    setSelectedIndex(validIndex.toString());
    onSelect(videoDevices[validIndex].deviceId, validIndex);
  }, [videoDevices, onSelect]);

  const handleSelect = (value: string) => {
    const index = parseInt(value, 10);
    setSelectedIndex(value);
    localStorage.setItem(CAMERA_STORAGE_KEY, value);
    onSelect(videoDevices[index].deviceId, index);

    toast.success(
      `Camera switched to ${videoDevices[index].label || `Camera ${index}`}`
    );
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (videoDevices.length === 0) {
    return (
      <div className="text-sm text-muted-foreground mb-4">
        No cameras detected.
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Select value={selectedIndex} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a camera" />
        </SelectTrigger>
        <SelectContent>
          {videoDevices.map((camera, index) => (
            <SelectItem key={camera.deviceId} value={index.toString()}>
              {camera.label || `Camera ${index}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
