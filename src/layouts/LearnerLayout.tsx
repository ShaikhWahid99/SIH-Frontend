import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LearnerSidebar } from "@/components/shared/LearnerSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Bell } from "lucide-react";

interface LearnerLayoutProps {
  children: ReactNode;
}

export const LearnerLayout = ({ children }: LearnerLayoutProps) => {
  const { isAuthenticated, user, logout, loading } = useAuth();

  // 🔵 1. Wait for Auth Provider to finish loading
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-foreground">
        Loading...
      </div>
    );
  }

  // 🔵 2. Redirect ONLY after loading is complete
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <LearnerSidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Welcome back, {user?.displayName || user?.email}!
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
