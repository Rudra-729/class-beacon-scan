import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSEO } from "@/hooks/use-seo";
import { isAttendanceOpen } from "@/lib/attendanceWindow";

export default function StudentPage() {
  useSEO({
    title: "Student Attendance Check‑in (Face + BLE)",
    description: "Prototype check-in using camera and BLE proximity with a timed window.",
  });

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [blePresent, setBlePresent] = useState(false);
  const [windowOpen, setWindowOpen] = useState(isAttendanceOpen());
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setWindowOpen(isAttendanceOpen()), 1000);
    const onStorage = () => setWindowOpen(isAttendanceOpen());
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

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

  const canCheckIn = cameraReady && blePresent && windowOpen;

  function handleCheckIn() {
    alert("Checked in (prototype) — would upload face embedding + BLE proximity & timestamp.");
  }

  return (
    <Layout>
      <article className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Student Check‑in</h1>
          <p className="text-muted-foreground">You can check in only while the attendance window is open.</p>
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
              <CardTitle>Check‑in</CardTitle>
              <CardDescription>All requirements must be satisfied to enable check‑in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                <li>Attendance window: {windowOpen ? "Open" : "Closed"}</li>
                <li>Camera: {cameraReady ? "Ready" : "Not ready"}</li>
                <li>BLE: {blePresent ? "Present" : "Not present"}</li>
              </ul>
              <Button disabled={!canCheckIn} onClick={handleCheckIn}>
                {canCheckIn ? "Check In" : "Requirements Not Met"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </article>
    </Layout>
  );
}
