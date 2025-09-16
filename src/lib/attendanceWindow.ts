// Simple localStorage-backed attendance window prototype helpers

const KEY = "attendanceWindowUntil";

export function setAttendanceWindowMinutes(minutes: number) {
  const until = Date.now() + minutes * 60 * 1000;
  localStorage.setItem(KEY, String(until));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: String(until) }));
}

export function clearAttendanceWindow() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: null } as any));
}

export function getAttendanceWindowUntil(): number | null {
  const raw = localStorage.getItem(KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function isAttendanceOpen(): boolean {
  const until = getAttendanceWindowUntil();
  return !!until && Date.now() < until;
}

export function getRemainingMs(): number {
  const until = getAttendanceWindowUntil();
  return until ? Math.max(0, until - Date.now()) : 0;
}
