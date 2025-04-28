/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Camera, UserX, Loader2 } from "lucide-react";
import { UserList } from "@/components/user-list";
import { FaceRecognition } from "@/components/face-recognition";
import { getUsers } from "@/lib/actions/users";
import { getSessionDetails } from "@/app/dashboard/supervisor/_components/attendance";
import { AttendanceRecord } from "@/types";
import { CameraSelector } from "./camera-selector";
import AttendanceControl from "./attendance-control";

interface User {
  id: number;
  name: string;
  email: string;
  organization_id: number;
}

interface AttendanceManagementProps {
  sessionId: number;
}

export function AttendanceManagement({ sessionId }: AttendanceManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, sessionData] = await Promise.all([
          getUsers("user"),
          getSessionDetails(sessionId),
        ]);

        const mappedUsers: User[] = (usersData.users || []).map(
          (user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            organization_id: user.organization_id,
          })
        );

        setUsers(mappedUsers);
        setAttendanceRecords(sessionData.session?.records || []);
        setFilteredUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, refreshTrigger]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      query
        ? users.filter(
            (user) =>
              user.name.toLowerCase().includes(query) ||
              user.email.toLowerCase().includes(query)
          )
        : users
    );
  }, [searchQuery, users]);

  const refreshData = () => setRefreshTrigger((prev) => prev + 1);

  const presentUserIds = new Set(attendanceRecords.map((r) => r.user_id));
  const presentUsers = users.filter((user) => presentUserIds.has(user.id));
  const absentUsers = filteredUsers.filter(
    (user) => !presentUserIds.has(user.id)
  );

  return (
    <Tabs defaultValue="manual" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="manual">Manual Attendance</TabsTrigger>
        <TabsTrigger value="recognition">Face Recognition</TabsTrigger>
        <TabsTrigger value="external">External Window</TabsTrigger>
      </TabsList>

      <TabsContent value="manual" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Absent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserX className="mr-2 h-5 w-5 text-red-500" />
                Absent Users
              </CardTitle>
              <CardDescription>Mark users as present manually</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : absentUsers.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {users.length === 0
                    ? "No users found"
                    : "All users are present!"}
                </p>
              ) : (
                <UserList
                  users={absentUsers}
                  sessionId={sessionId}
                  onAttendanceMarked={refreshData}
                  emptyMessage="All users are present!"
                />
              )}
            </CardContent>
          </Card>

          {/* Present Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-green-500" />
                Present Users
              </CardTitle>
              <CardDescription>
                Users who have been marked present
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : presentUsers.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No users marked present yet
                </p>
              ) : (
                <div className="space-y-2">
                  {presentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 bg-green-50 border border-green-100 rounded-md flex items-center"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <UserCheck className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="recognition">
        <Card className="max-w-[700px] mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5" />
              Face Recognition
            </CardTitle>
            <CardDescription>
              Mark attendance automatically using face recognition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CameraSelector
              onSelect={(deviceId, index) => setSelectedCameraIndex(index)}
            />
            {recognitionActive ? (
              <>
                <FaceRecognition
                  sessionId={sessionId}
                  cameraIndex={selectedCameraIndex}
                  onComplete={() => {
                    setRecognitionActive(false);
                    refreshData();
                  }}
                />
                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  onClick={() => setRecognitionActive(false)}
                >
                  Stop Recognition
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4 text-muted-foreground">
                  Click the button below to start face recognition for automatic
                  attendance
                </p>
                <Button
                  className="w-full md:w-auto"
                  onClick={() => setRecognitionActive(true)}
                >
                  Start Face Recognition
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="external">
        <Card className="max-w-[700px] mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5" />
              External Window
            </CardTitle>
            <CardDescription>
              Mark attendance automatically using face recognition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CameraSelector
              onSelect={(deviceId, index) => setSelectedCameraIndex(index)}
            />
            <AttendanceControl
              cameraIndex={selectedCameraIndex}
              sessionId={sessionId}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
