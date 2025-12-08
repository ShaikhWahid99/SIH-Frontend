import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/shared/TextInput";
import { useToast } from "@/hooks/use-toast"; // ✅ API TRANSLATOR
import { FcGoogle } from "react-icons/fc";


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ LANGUAGE STATE
  const [lang, setLang] = useState("en");

  // ✅ TRANSLATED TEXT STATES
  const [welcomeTitle, setWelcomeTitle] = useState("Welcome back");
  const [welcomeDesc, setWelcomeDesc] = useState("Login to continue your learning journey");
  const [emailLabel, setEmailLabel] = useState("Email");
  const [passwordLabel, setPasswordLabel] = useState("Password");
  const [loginBtn, setLoginBtn] = useState("Login");
  const [loggingInBtn, setLoggingInBtn] = useState("Logging in...");
  const [orText, setOrText] = useState("or");
  const [googleText, setGoogleText] = useState("Continue with Google");
  const [noAccountText, setNoAccountText] = useState("Don't have an account?");
  const [registerText, setRegisterText] = useState("Register here");

  const [toastWelcomeTitle, setToastWelcomeTitle] = useState("Welcome back!");
  const [toastWelcomeDesc, setToastWelcomeDesc] = useState("You have successfully logged in.");
  const [toastErrorTitle, setToastErrorTitle] = useState("Login failed");
  const [toastErrorDesc, setToastErrorDesc] = useState("Please check your email or password.");

  // ✅ AUTO TRANSLATE ON LANGUAGE CHANGE
  

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
        title: toastWelcomeTitle,
        description: toastWelcomeDesc,
      });

      if (!me.onboarded) return navigate("/onboarding", { replace: true });
      if (!me.quizCompleted) return navigate("/quiz", { replace: true });

      navigate("/learner/dashboard", { replace: true });
    } catch (err) {
      toast({
        title: toastErrorTitle,
        description: toastErrorDesc,
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
      {/* Adjusted LANGUAGE SWITCH BUTTONS */}
      {/* <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => setLang("en")} className="border px-2 py-1 rounded">EN</button>
        <button onClick={() => setLang("hi")} className="border px-2 py-1 rounded">HI</button>
        <button onClick={() => setLang("mr")} className="border px-2 py-1 rounded">MR</button>
      </div> */}

      {/* --- TRAINER BUTTON --- */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 left-4 z-10"
        onClick={() => navigate("/auth/trainer-login")}
      >
        Login as Trainer
      </Button>

      <div className="mb-6 text-center mt-12"> 
        {/* Added margin-top to ensure text doesn't overlap */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {welcomeTitle}
        </h1>
        <p className="text-muted-foreground">
          {welcomeDesc}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label={emailLabel}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextInput
          label={passwordLabel}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? loggingInBtn : loginBtn}
        </Button>
      </form>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">{orText}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mt-4">
          <Button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3"
            variant="outline"
          >
            <FcGoogle />{googleText}
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {noAccountText}{" "}
          <Link
            to="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            {registerText}
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginPage;
