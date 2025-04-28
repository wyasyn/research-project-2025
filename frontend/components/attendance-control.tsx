"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
const serverApi = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AttendanceControl({
  sessionId,
  cameraIndex = 0,
}: {
  sessionId: number;
  cameraIndex?: number;
}) {
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);

  const startRecognition = async () => {
    if (!sessionId) {
      setError("Please enter a session ID.");
      return;
    }
    setError(null);
    setStatus("Starting...");

    try {
      const res = await fetch(
        `${serverApi}/recognize/window/${sessionId}?camera=${cameraIndex}`
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setStatus(data.message || "Stopped");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setStatus("Error");
    }
  };

  const stopRecognition = async () => {
    if (!sessionId) {
      setError("Please enter a session ID.");
      return;
    }
    setError(null);
    setStatus("Stopping...");

    try {
      const res = await fetch(`${serverApi}/recognize/stop/${sessionId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setStatus(data.message || "Stopped");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setStatus("Error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow rounded-2xl">
      <div className="flex space-x-4 mb-4">
        <Button
          variant={"default"}
          type="button"
          onClick={startRecognition}
          disabled={status === "Starting..." || status === "Stopping..."}
        >
          Start
        </Button>
        <Button
          variant={"destructive"}
          type="button"
          onClick={stopRecognition}
          disabled={status === "Stopping..." || status === "Idle"}
        >
          Press &quot;q&quot; to stop
        </Button>
      </div>
      <div className="mb-2">
        <span className="font-medium">Status:</span> {status}
      </div>
      {error && <div className="text-red-500">Error: {error}</div>}
    </div>
  );
}
