import { ReactNode, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  Users,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  Brain,
  Compass,
 
  Trophy,
  Rocket,
  Heart,
  Briefcase,
  Globe,
  User,
  MapPin,
  Smile,
  
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type QuizCategory = "interest" | "skills" | "purpose" | "career" | "personality";

interface QuizQuestion {
  id: number;
  question: string;
  type: "single";
  options: string[];
  icon?: ReactNode;
  category: QuizCategory;
}

interface QuizAnswers {
  [key: number]: string;
}

const quizQuestions: QuizQuestion[] = [
  // ──────────────── 🎯 A. What You Love (Interest & Passion) ────────────────
  {
    id: 1,
    question: "Which type of activities do you enjoy the most?",
    type: "single",
    category: "interest",
    icon: <Heart className="w-5 h-5" />,
    options: [
      "Working with machines or tools",
      "Helping or interacting with people",
      "Solving problems or analyzing data",
      "Creating or designing things",
      "Working outdoors or doing physical tasks",
    ],
  },
  {
    id: 2,
    question: "What topics or fields excite you the most?",
    type: "single",
    category: "interest",
    icon: <Heart className="w-5 h-5" />,
    options: [
      "Technology & computers",
      "Healthcare & helping others",
      "Business & management",
      "Art, design, or creativity",
      "Nature, field work, or environment",
    ],
  },

  // ──────────────── 🧠 B. Skills & Strengths ────────────────
  {
    id: 4,
    question: "Which of the following describes your strongest ability?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: [
      "Technical or mechanical skills",
      "Communication and people skills",
      "Creative thinking",
      "Logical/analytical thinking",
      "Physical/manual work",
    ],
  },
  {
    id: 5,
    question: "How comfortable are you working with machines, tools, or digital equipment?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: [
      "Very comfortable",
      "Somewhat comfortable",
      "A little uncomfortable",
      "Not comfortable at all",
    ],
  },

  // ──────────────── 🌍 Purpose & Impact ────────────────
  {
    id: 8,
    question: "Do you like identifying problems and improving systems or processes?",
    type: "single",
    category: "purpose",
    icon: <Globe className="w-5 h-5" />,
    options: [
      "Yes, I enjoy it a lot",
      "Yes, but only simple improvements",
      "Sometimes",
      "Not at all",
    ],
  },
  {
    id: 9,
    question: "What motivates you the most in a career?",
    type: "single",
    category: "purpose",
    icon: <Globe className="w-5 h-5" />,
    options: [
      "Helping people",
      "Creating/improving things",
      "Stable income",
      "Solving challenging problems",
      "Doing productive physical work",
    ],
  },

  // ──────────────── 💼 Career Fit ────────────────
  {
    id: 10,
    question: "What type of work environment do you prefer?",
    type: "single",
    category: "career",
    icon: <Briefcase className="w-5 h-5" />,
    options: [
      "Office",
      "Field/outdoor",
      "Workshop/lab",
      "Remote/digital",
      "Any environment",
    ],
  },
  {
    id: 11,
    question: "How comfortable are you with taking responsibility?",
    type: "single",
    category: "career",
    icon: <Briefcase className="w-5 h-5" />,
    options: [
      "Very comfortable",
      "Somewhat comfortable",
      "Slightly uncomfortable",
      "Not comfortable at all",
    ],
  },
  {
    id: 12,
    question: "What type of tasks do you like?",
    type: "single",
    category: "career",
    icon: <Briefcase className="w-5 h-5" />,
    options: [
      "Routine and predictable",
      "Dynamic and changing",
      "Creative and flexible",
      "Physical and hands-on",
    ],
  },

  // ──────────────── ⚡ Personality & Style ────────────────
  {
    id: 13,
    question: "How do you usually handle pressure or difficult situations?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Very well", "Well", "Not very well", "Poorly"],
  },
  {
    id: 14,
    question: "What teamwork style suits you best?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: [
      "Leading a team",
      "Working with a team",
      "Supporting teammates",
      "Working alone",
    ],
  },
  {
    id: 15,
    question: "What type of problems do you prefer solving?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: [
      "Technical issues",
      "People issues",
      "Creative challenges",
      "Physical challenges",
    ],
  },
];



const categoryColors: Record<QuizCategory, string> = {
  interest: "bg-rose-500 text-white",
  skills: "bg-amber-500 text-white",
  purpose: "bg-emerald-500 text-white",
  career: "bg-[hsl(var(--primary)/0.9)] text-white",
  personality: "bg-purple-500 text-white",
};


const categoryLabels: Record<QuizCategory, string> = {
  interest: "Interests & Passion",
  skills: "Skills & Strengths",
  purpose: "Purpose & Impact",
  career: "Career Fit",
  personality: "Personality & Style",
};


const questionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.98,
  }),
};


const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const currentQuestionData = quizQuestions[currentQuestion];
  const progressPercentage =
    ((currentQuestion + 1) / quizQuestions.length) * 100;
  const isCurrentQuestionAnswered =
    answers[currentQuestionData.id] !== undefined &&
    answers[currentQuestionData.id] !== "";

  const handleAnswer = (answer: string) => {
    const q = quizQuestions[currentQuestion];
    setAnswers((prev) => ({
      ...prev,
      [q.id]: answer,
    }));
  };

  const handleNext = () => {
    if (!isCurrentQuestionAnswered) return;

    if (currentQuestion < quizQuestions.length - 1) {
      setDirection(1);
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    if (index === currentQuestion) return;
    setDirection(index > currentQuestion ? 1 : -1);
    setCurrentQuestion(index);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const onboardingData = localStorage.getItem("onboardingData");
      const parsedOnboardingData = onboardingData
        ? JSON.parse(onboardingData)
        : {};

      // Build structured quiz responses with full context
      const quizResponses = quizQuestions.map((q) => ({
        questionId: q.id,
        question: q.question,
        category: q.category,
        answer: answers[q.id] ?? "",
      }));

      const completeProfileData = {
        ...parsedOnboardingData,
        quizAnswers: answers, // keep for compatibility with existing backend logic
        quizResponses,
        quizCompleted: true,
        profileCompletedAt: new Date().toISOString(),
      };

      try {
        await api.postMe(completeProfileData);
        await refreshUser();
        localStorage.removeItem("onboardingData");
      } catch (apiError) {
        console.error("API submission failed, saving locally:", apiError);
        localStorage.setItem(
          "userProfile",
          JSON.stringify(completeProfileData)
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      navigate("/adaptive-quiz", { replace: true });

      // toast({
      //   title: "Profile Setup Complete! 🚀",
      //   description: "Your personalized dashboard is ready.",
      // });

      // navigate("/learner/dashboard", { replace: true });
    } catch (error) {
      console.error("Quiz submission error:", error);
      toast({
        title: "Submission Error",
        description:
          "There was an error saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startQuiz = () => {
    setShowWelcomePopup(false);
  };


  const renderOptions = (question: QuizQuestion) => {
    const currentAnswer = answers[question.id];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isSelected = currentAnswer === option;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleAnswer(option)}
              className={`relative p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 group
                ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 text-blue-800 shadow-sm scale-[1.01]"
                    : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm hover:scale-[1.01] text-gray-700"
                }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm md:text-base leading-relaxed">
                    {option}
                  </p>
                </div>
                <div
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 group-hover:border-blue-300"
                    }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // ───────────────────── QUIZ VIEW ─────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-6 px-4">
      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8 shadow-xl border-0 bg-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Let&apos;s Personalize Your Learning Journey
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                This short quiz helps us understand your learning
                preferences, goals, and style so we can create a
                personalized path just for you.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Understand your learning style
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Match you with the right resources
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Create a realistic learning schedule
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-700">
                  <div className="text-center">
                    <div className="font-semibold text-lg text-blue-600">
                      {quizQuestions.length}
                    </div>
                    <div>Questions</div>
                  </div>
                  <div className="w-px h-8 bg-blue-200"></div>
                  <div className="text-center">
                    <div className="font-semibold text-lg text-blue-600">
                      5–7
                    </div>
                    <div>Minutes</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={startQuiz}
                className="w-full gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Start Quiz
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-xs text-gray-500 mt-4">
                Your answers will help us build the best learning path
                for your goals.
              </p>
            </div>
          </Card>
        </div>
      )}

      <div
        className={`max-w-6xl mx-auto transition-all duration-300 ${
          showWelcomePopup ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Learning Preferences Quiz
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-blue-700">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px,1fr] gap-8 items-start">
          <Card className="p-5 bg-white/80 border-slate-200 shadow-sm sticky top-6 self-start">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">
              Overview
            </h3>

            <div className="mb-4">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[currentQuestionData.category]}`}
              >
                {currentQuestionData.icon}
                <span>{categoryLabels[currentQuestionData.category]}</span>
              </div>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="relative w-28 h-28 mb-2">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={
                      251.2 * (1 - progressPercentage / 100)
                    }
                    className="text-blue-600 transition-all duration-700 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">
                    {currentQuestion + 1}
                  </span>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wide">
                    Current
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Answer each question honestly to get the most accurate
                learning path.
              </p>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              <h4 className="text-xs font-medium text-slate-500 uppercase">
                Questions
              </h4>
              <div className="grid grid-cols-5 gap-1.5 mt-1">
                {quizQuestions.map((q, index) => {
                  const answered = Boolean(answers[q.id]);
                  const isActive = index === currentQuestion;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleQuestionJump(index)}
                      className={`h-7 w-7 rounded-full text-[11px] font-medium flex items-center justify-center transition-all
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : answered
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-sm">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestionData.id}
                variants={questionVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-xl ${categoryColors[currentQuestionData.category]}`}
                      >
                        {currentQuestionData.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {categoryLabels[currentQuestionData.category]}
                        </p>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug mt-1">
                          {currentQuestionData.question}
                        </h2>
                      </div>
                    </div>
                    <span className="hidden md:inline-flex text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                      Single choice
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Choose the option that describes you best. There is no
                    right or wrong answer.
                  </p>
                </div>

                <div className="min-h-[220px]">
                  {renderOptions(currentQuestionData)}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="gap-2 px-5 py-2.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="text-xs text-slate-500">
                    {isCurrentQuestionAnswered
                      ? "Great, answer saved."
                      : "Select one option to continue."}
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={!isCurrentQuestionAnswered || isSubmitting}
                    className="gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                  >
                    {currentQuestion === quizQuestions.length - 1
                      ? "See Results"
                      : "Next Question"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;



















