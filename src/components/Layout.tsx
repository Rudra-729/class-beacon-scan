import { Link, NavLink } from "react-router-dom";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between py-3">
          <Link to="/" className="font-semibold">
            Class Beacon Scan
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <NavLink to="/student" className={({ isActive }) => isActive ? "underline" : "hover:underline"}>
              Student
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => isActive ? "underline" : "hover:underline"}>
              Admin
            </NavLink>
            <NavLink to="/attendance" className={({ isActive }) => isActive ? "underline" : "hover:underline"}>
              Records
            </NavLink>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
