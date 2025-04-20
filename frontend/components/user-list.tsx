"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { markAttendance } from "@/app/dashboard/supervisor/_components/attendance";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  users: User[];
  sessionId: number;
  onAttendanceMarked: () => void;
  emptyMessage?: string;
}

export function UserList({
  users,
  sessionId,
  onAttendanceMarked,
  emptyMessage = "No users found",
}: UserListProps) {
  const [markingUsers, setMarkingUsers] = useState<Record<number, boolean>>({});

  const handleMarkAttendance = async (userId: number) => {
    setMarkingUsers((prev) => ({ ...prev, [userId]: true }));

    try {
      await markAttendance(userId, sessionId);

      toast("User has been marked as present");

      onAttendanceMarked();
    } catch (error) {
      console.error("Error marking attendance:", error);

      toast("Failed to mark attendance. Please try again.");
    } finally {
      setMarkingUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (users.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {users.map((user) => (
        <div
          key={user.id}
          className="p-3 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between"
        >
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button
            size="sm"
            onClick={() => handleMarkAttendance(user.id)}
            disabled={!!markingUsers[user.id]}
          >
            {markingUsers[user.id] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" /> Mark Present
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
