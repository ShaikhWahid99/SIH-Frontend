import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/shared/TextInput";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });
      toast({
        title: "Account created!",
        description: "Welcome to LearnPath AI. Let's set up your profile.",
      });
      navigate("/auth/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Create your account
        </h1>
        <p className="text-muted-foreground">
          Start your personalized learning journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <TextInput
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default RegisterPage;
