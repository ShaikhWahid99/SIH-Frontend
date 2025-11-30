import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveTokens } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken || !refreshToken) {
      console.error("Missing OAuth tokens");
      navigate("/auth/login", { replace: true });
      return;
    }

    // Save tokens to localStorage
    saveTokens(accessToken, refreshToken);

    // Load fresh user profile
    refreshUser()
      .then((me) => {
        if (!me) {
          navigate("/auth/login", { replace: true });
          return;
        }

        if (!me.onboarded) {
          navigate("/onboarding", { replace: true });
          return;
        }

        if (!me.quizCompleted) {
          navigate("/quiz", { replace: true });
          return;
        }

        navigate("/learner/dashboard", { replace: true });
      })
      .catch(() => {
        navigate("/auth/login", { replace: true });
      });
  }, []);

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
    <div className="flex flex-col items-center animate-fadeIn">
      {/* Spinner Circle */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-blue-300" />
        <Loader2 className="absolute inset-0 m-auto w-12 h-12 text-blue-600 animate-spin" />
      </div>

      {/* Text */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Logging you in...
      </h1>
      <p className="text-gray-600 text-sm">
        Please wait while we set up your session
      </p>
    </div>
  </div>
  );
};

export default OAuthSuccessPage;
