import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { clearAttendanceWindow, getRemainingMs, getAttendanceWindowUntil, isAttendanceOpen, setAttendanceWindowMinutes } from "@/lib/attendanceWindow";

function formatDuration(ms: number) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function AdminPage() {
  useSEO({
    title: "Admin Attendance Window Control",
    description: "Open/close timed check-in windows for students (prototype).",
  });

  const [open, setOpen] = useState(isAttendanceOpen());
  const [until, setUntil] = useState<number | null>(getAttendanceWindowUntil());
  const remaining = useMemo(() => (open ? getRemainingMs() : 0), [open]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpen(isAttendanceOpen());
      setUntil(getAttendanceWindowUntil());
    }, 1000);
    const onStorage = () => {
      setOpen(isAttendanceOpen());
      setUntil(getAttendanceWindowUntil());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={['professor']}>
      <Layout>
      <article className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Attendance Window</h1>
          <p className="text-muted-foreground">Control when students can check in. Uses localStorage for demo state sync.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Session Control</CardTitle>
            <CardDescription>Open a timed window; students can check in only while it is open.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button onClick={() => setAttendanceWindowMinutes(5)} disabled={open}>
                Start 5‑minute Window
              </Button>
              <Button variant="secondary" onClick={() => setAttendanceWindowMinutes(10)} disabled={open}>
                Start 10‑minute Window
              </Button>
              <Button variant="destructive" onClick={() => clearAttendanceWindow()} disabled={!open}>
                End Now
              </Button>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold">{open ? "Open" : "Closed"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ends</p>
                  <p className="text-lg font-semibold">{until ? new Date(until).toLocaleTimeString() : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-lg font-semibold">{open ? formatDuration(remaining) : "00:00"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="mt-8 text-sm text-muted-foreground">
          <p>
            Note: This is a frontend prototype. For real use, connect Supabase for auth, roles, sessions, and server‑time control.
          </p>
        </section>
      </article>
    </Layout>
  </ProtectedRoute>
  );
}
