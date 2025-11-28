import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { LearnerLayout } from "./layouts/LearnerLayout";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OnboardingPage from "./pages/learner/OnboardingPage";
import DashboardPage from "./pages/learner/DashboardPage";
import PathwayListPage from "./pages/learner/PathwayListPage";
import PathwayDetailPage from "./pages/learner/PathwayDetailPage";
import CourseDetailPage from "./pages/learner/CourseDetailPage";
import ProfilePage from "./pages/learner/ProfilePage";
import ProgressPage from "./pages/learner/ProgressPage";
import FeedbackPage from "./pages/learner/FeedbackPage";
import NotFound from "./pages/NotFound";
import QuizPage from "./pages/learner/QuizPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
            <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
            <Route path="/auth/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/auth/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/learner/dashboard" element={<LearnerLayout><DashboardPage /></LearnerLayout>} />
            <Route path="/learner/pathways" element={<LearnerLayout><PathwayListPage /></LearnerLayout>} />
            <Route path="/learner/pathways/:id" element={<LearnerLayout><PathwayDetailPage /></LearnerLayout>} />
            <Route path="/learner/courses/:id" element={<LearnerLayout><CourseDetailPage /></LearnerLayout>} />
            <Route path="/learner/profile" element={<LearnerLayout><ProfilePage /></LearnerLayout>} />
            <Route path="/learner/progress" element={<LearnerLayout><ProgressPage /></LearnerLayout>} />
            <Route path="/learner/feedback" element={<LearnerLayout><FeedbackPage /></LearnerLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
