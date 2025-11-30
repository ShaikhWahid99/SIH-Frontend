import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/shared/TextInput";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call login → stores tokens
      await login(email, password);

      // Always pull latest user profile
      const me = await refreshUser();

      if (!me) {
        throw new Error("Unable to fetch user");
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // Decide where to go next
      if (!me.onboarded) {
        navigate("/onboarding", { replace: true });
        return;
      }

      if (!me.quizCompleted) {
        navigate("/quiz", { replace: true });
        return;
      }

      navigate("/learner/dashboard", { replace: true });

    } catch (err) {
      toast({
        title: "Login failed",
        description: "Please check your email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = api.startGoogle();
  };

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Login to continue your learning journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mt-4">
          <Button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3"
            variant="outline"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M44.5 20H24v8.5h11.9C34.8 32.4 30.1 36 24 36c-7 0-12.7-5.7-12.7-12.7S17 10.6 24 10.6c3.4 0 6.4 1.3 8.7 3.4l6.1-6.1C35.9 4.5 30.4 2 24 2 12.3 2 3 11.3 3 23s9.3 21 21 21c11 0 20-8 20-21 0-1.4-.1-2.4-.5-3z"
                fill="#FFC107"
              />
              <path
                d="M6.3 14.4l7.1 5.2A13 13 0 0124 10.6c3.4 0 6.4 1.3 8.7 3.4l6.1-6.1C35.9 4.5 30.4 2 24 2 14.7 2 6.9 7.9 6.3 14.4z"
                fill="#FF3D00"
              />
              <path
                d="M24 46c6.1 0 11.6-2.1 15.9-5.8l-7.4-6c-2.2 1.6-5 2.6-8.5 2.6-6.1 0-11.4-4.1-13.3-9.6l-7.5 5.8C8.9 40.8 15.8 46 24 46z"
                fill="#4CAF50"
              />
              <path
                d="M44.5 20H24v8.5h11.9c-1.1 3.4-3.6 6.2-6.9 7.8l7.4 6C41.8 36.1 46 30.5 46 24c0-1.4-.1-2.4-.5-3z"
                fill="#1976D2"
              />
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginPage;
