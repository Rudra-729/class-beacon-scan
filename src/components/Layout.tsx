import { Link, NavLink } from "react-router-dom";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, profile, signOut, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between py-3">
          <Link to="/" className="font-semibold">
            Attendify
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {user && profile ? (
              <>
                {profile.role === 'student' && (
                  <NavLink to="/student" className={({ isActive }) => isActive ? "underline" : "hover:underline"}>
                    Check-in
                  </NavLink>
                )}
                {profile.role === 'professor' && (
                  <>
                    <NavLink to="/admin" className={({ isActive }) => isActive ? "underline" : "hover:underline"}>
                      Admin
                    </NavLink>
                    <NavLink to="/attendance" className={({ isActive }) => isActive ? "underline" : "hover:underline"}>
                      Records
                    </NavLink>
                  </>
                )}
                <span className="text-muted-foreground">
                  {profile.full_name} ({profile.role})
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Logout
                </Button>
              </>
            ) : (
              !loading && (
                <Button asChild>
                  <Link to="/auth">Login</Link>
                </Button>
              )
            )}
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
