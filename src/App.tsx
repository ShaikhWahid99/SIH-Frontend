// src/App.tsx
import React from "react";
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
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthSuccess from "./pages/auth/OAuthSuccess";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* PUBLIC PAGES */}
            <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
            <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />

            {/* AUTH PAGES */}
            <Route path="/auth/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/auth/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarded={false}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quiz"
              element={
                <ProtectedRoute requireOnboarded={true} requireQuiz={false}>
                  <QuizPage />
                </ProtectedRoute>
              }
            />

            {/* LEARNER DASHBOARD (both onboarding + quiz must be done) */}
            <Route
              path="/learner/dashboard"
              element={
                <ProtectedRoute requireOnboarded={true} requireQuiz={true}>
                  <LearnerLayout>
                    <DashboardPage />
                  </LearnerLayout>
                </ProtectedRoute>
              }
            />

            {/* ALL LEARNER ROUTES */}
            <Route
              path="/learner/pathways"
              element={
                <ProtectedRoute requireOnboarded={true} requireQuiz={true}>
                  <LearnerLayout><PathwayListPage /></LearnerLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/learner/pathways/:id"
              element={
                <ProtectedRoute requireOnboarded={true} requireQuiz={true}>
                  <LearnerLayout><PathwayDetailPage /></LearnerLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/learner/courses/:id"
              element={
                <ProtectedRoute requireOnboarded={true} requireQuiz={true}>
                  <LearnerLayout><CourseDetailPage /></LearnerLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/learner/profile"
              element={
                <ProtectedRoute requireOnboarded={true} requireQuiz={true}>
                  <LearnerLayout><ProfilePage /></LearnerLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/learner/progress"
              element={
                <ProtectedRoute requireOnboarded={true} requireQuiz={true}>
                  <LearnerLayout><ProgressPage /></LearnerLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/learner/feedback"
              element={
                <ProtectedRoute requireOnboarded={true} requireQuiz={true}>
                  <LearnerLayout><FeedbackPage /></LearnerLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
