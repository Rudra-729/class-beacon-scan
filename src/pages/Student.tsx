import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isAttendanceOpen } from "@/lib/attendanceWindow";
import { supabase } from "@/integrations/supabase/client";

export default function StudentPage() {
  useSEO({
    title: "Student Attendance Check‑in",
    description: "Check-in using camera and BLE proximity verification.",
  });

  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [blePresent, setBlePresent] = useState(false);
  const [windowOpen, setWindowOpen] = useState(isAttendanceOpen());
  const [subjects, setSubjects] = useState<{id: string, name: string, code: string}[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setWindowOpen(isAttendanceOpen()), 1000);
    const onStorage = () => setWindowOpen(isAttendanceOpen());
    window.addEventListener("storage", onStorage);
    fetchSubjects();
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  async function fetchSubjects() {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code")
        .order("name");

      if (error) throw error;
      
      setSubjects(data || []);
      if (data && data.length > 0) {
        setSelectedSubject(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects. Please refresh the page.",
        variant: "destructive",
      });
    }
  }

  async function requestCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (e: any) {
      setCameraError(e?.message ?? "Unable to access camera in this environment.");
      setCameraReady(false);
    }
  }

  // BLE simulation (Web Bluetooth requires HTTPS + user gesture; we mock here)
  function simulateBleScan() {
    // Toggle presence for prototype
    setBlePresent((v) => !v);
  }

  const canCheckIn = cameraReady && blePresent && windowOpen && selectedSubject && user && profile;

  async function handleCheckIn() {
    if (!canCheckIn || !user || !profile) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("attendance_records")
        .insert({
          user_id: user.id,
          subject_id: selectedSubject,
          student_id: profile.student_id || `temp_${user.id}`,
          student_name: profile.full_name,
          student_email: user.email || null,
        });

      if (error) throw error;

      toast({
        title: "Check-in Successful!",
        description: `Attendance recorded for ${profile.full_name} in ${subjects.find(s => s.id === selectedSubject)?.name}`,
      });

    } catch (error: any) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Check-in Failed",
        description: error.message || "An error occurred while recording attendance.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Layout>
        <article className="mx-auto max-w-2xl">
          <header className="mb-6">
            <h1 className="text-3xl font-bold">Student Check‑in</h1>
            <p className="text-muted-foreground">Welcome {profile?.full_name}! Check in when the attendance window is open.</p>
          </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Camera</CardTitle>
              <CardDescription>Enable camera for face verification (prototype only).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <AspectRatio ratio={16 / 9}>
                  {cameraReady ? (
                    <video ref={videoRef} className="h-full w-full rounded-md object-cover" muted playsInline />
                  ) : (
                    <img
                      src="/placeholder.svg"
                      loading="lazy"
                      alt="Camera preview placeholder for face verification"
                      className="h-full w-full rounded-md object-cover opacity-75"
                    />
                  )}
                </AspectRatio>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={requestCamera}>Request Camera</Button>
                {cameraError && <p className="text-sm text-muted-foreground">{cameraError}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>BLE Proximity</CardTitle>
              <CardDescription>Must be near the classroom beacon. This is simulated here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm text-muted-foreground">Beacon status</span>
                <span className="font-medium">{blePresent ? "Detected" : "Not detected"}</span>
              </div>
              <Button variant="secondary" onClick={simulateBleScan}>
                {blePresent ? "Simulate Beacon Lost" : "Simulate Beacon Found"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject Selection</CardTitle>
              <CardDescription>Choose the subject for which you want to record attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check‑in</CardTitle>
              <CardDescription>All requirements must be satisfied to enable check‑in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                <li>Attendance window: {windowOpen ? "Open" : "Closed"}</li>
                <li>Camera: {cameraReady ? "Ready" : "Not ready"}</li>
                <li>BLE: {blePresent ? "Present" : "Not present"}</li>
                <li>Subject: {selectedSubject ? "Selected" : "Not selected"}</li>
                <li>Profile: {user && profile ? "Authenticated" : "Not authenticated"}</li>
              </ul>
              <Button disabled={!canCheckIn || isSubmitting} onClick={handleCheckIn}>
                {isSubmitting ? "Recording..." : canCheckIn ? "Check In" : "Requirements Not Met"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </article>
    </Layout>
  </ProtectedRoute>
  );
}
