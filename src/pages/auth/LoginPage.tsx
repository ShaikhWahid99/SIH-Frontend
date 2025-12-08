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
      await login(email, password);
      const me = await refreshUser();

      if (!me) throw new Error("Unable to fetch user");

      toast({
        title: "✅ Login Successful",
        description: "You have successfully logged in.",
      });

      if (!me.onboarded) return navigate("/onboarding", { replace: true });
      if (!me.quizCompleted) return navigate("/quiz", { replace: true });

      navigate("/learner/dashboard", { replace: true });
    } catch (err) {
      toast({
        title: "❌ Login failed",
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
    <Card className="p-8 w-full max-w-md relative">

      {/* --- TRAINER BUTTON --- */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4"
        onClick={() => navigate("/auth/trainer-login")}
        data-translate
      >
        Login as Trainer
      </Button>

      <div className="mb-6 pr-24">
        <h1 className="text-2xl font-bold text-foreground mb-2" data-translate>
          Welcome back
        </h1>
        <p className="text-muted-foreground" data-translate>
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
          data-translate
        />

        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-translate
        />

        <Button type="submit" className="w-full" disabled={loading} data-translate>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400" data-translate>or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mt-4">
          <Button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3"
            variant="outline"
            data-translate
          >
            Continue with Google
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          <span data-translate>Don't have an account?</span>{" "}
          <Link
            to="/auth/register"
            className="text-primary font-medium hover:underline"
            data-translate
          >
            Register here
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginPage;
