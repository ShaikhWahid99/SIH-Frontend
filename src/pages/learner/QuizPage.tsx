// QuizPage.tsx
import { useState } from "react";
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
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface QuizQuestion {
  id: number;
  question: string;
  type: "single" | "multiple";
  options: string[];
  icon?: React.ReactNode;
  category: "learning" | "motivation" | "preferences" | "goals";
}

interface QuizAnswers {
  [key: number]: string | string[];
}

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  // THE REAL refreshUser FROM AuthContext
  const { refreshUser } = useAuth();

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "What drives your learning journey?",
      type: "single",
      category: "motivation",
      icon: <Target className="w-6 h-6" />,
      options: [
        "Career advancement and professional growth",
        "Personal passion and curiosity",
        "Skill development for current role",
        "Preparing for a career change"
      ]
    },
    {
      id: 2,
      question: "Which learning style resonates with you most?",
      type: "single",
      category: "learning",
      icon: <BookOpen className="w-6 h-6" />,
      options: [
        "Hands-on projects and practical application",
        "Structured courses with clear milestones",
        "Visual content like videos and diagrams",
        "Collaborative learning with peers"
      ]
    },
    {
      id: 3,
      question: "How do you prefer to tackle challenges?",
      type: "single",
      category: "learning",
      icon: <Zap className="w-6 h-6" />,
      options: [
        "Independent problem-solving and research",
        "Guidance from mentors or instructors",
        "Step-by-step tutorials and examples",
        "Group brainstorming and discussions"
      ]
    },
    {
      id: 4,
      question: "What's your ideal learning environment?",
      type: "single",
      category: "preferences",
      icon: <Users className="w-6 h-6" />,
      options: [
        "Self-paced with flexible scheduling",
        "Structured timeline with deadlines",
        "Interactive live sessions",
        "Mixed approach with both flexibility and structure"
      ]
    },
    {
      id: 5,
      question: "Which resources do you find most valuable?",
      type: "multiple",
      category: "preferences",
      icon: <Star className="w-6 h-6" />,
      options: [
        "Interactive coding platforms",
        "Video tutorials and demonstrations",
        "Comprehensive documentation",
        "Community forums and Q&A"
      ]
    },
    {
      id: 6,
      question: "How do you measure learning success?",
      type: "single",
      category: "goals",
      icon: <Target className="w-6 h-6" />,
      options: [
        "Building real-world projects",
        "Earning certificates and credentials",
        "Mastering core concepts thoroughly",
        "Solving complex problems independently"
      ]
    },
    {
      id: 7,
      question: "What time commitment works best for you?",
      type: "single",
      category: "preferences",
      icon: <Clock className="w-6 h-6" />,
      options: [
        "Short daily sessions (15-30 minutes)",
        "Longer weekly deep dives (2-3 hours)",
        "Intensive weekend learning",
        "Flexible based on energy and schedule"
      ]
    },
    {
      id: 8,
      question: "What support do you value most?",
      type: "multiple",
      category: "preferences",
      icon: <Users className="w-6 h-6" />,
      options: [
        "One-on-one mentorship",
        "Peer code reviews and feedback",
        "Detailed project feedback",
        "Career guidance and advice"
      ]
    }
  ];

  const categoryColors = {
    learning: "bg-blue-500 text-white",
    motivation: "bg-purple-500 text-white",
    preferences: "bg-green-500 text-white",
    goals: "bg-orange-500 text-white"
  };

  const categoryLabels = {
    learning: "Learning Style",
    motivation: "Motivation",
    preferences: "Preferences",
    goals: "Goals"
  };

  const handleAnswer = (answer: string) => {
    const q = quizQuestions[currentQuestion];

    if (q.type === "single") {
      setAnswers(prev => ({ ...prev, [q.id]: answer }));
    } else {
      const current = (answers[q.id] as string[]) || [];
      const updated = current.includes(answer)
        ? current.filter(v => v !== answer)
        : [...current, answer];

      setAnswers(prev => ({ ...prev, [q.id]: updated }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const onboardingData = JSON.parse(localStorage.getItem("onboardingData") || "{}");

      const payload = {
        ...onboardingData,
        quizAnswers: answers,
        quizCompleted: true
      };

      // Save user details + quiz to backend
      await api.postMe(payload);

      // Update frontend auth state
      await refreshUser();

      localStorage.removeItem("onboardingData");

      toast({
        title: "Quiz Completed!",
        description: "Redirecting you to your dashboard..."
      });

      navigate("/learner/dashboard", { replace: true });

    } catch (err) {
      console.error("Quiz submission failed:", err);

      toast({
        title: "Submission Error",
        description: "Could not submit quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOptions = (question: QuizQuestion) => {
    const currentAnswers = answers[question.id];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isSelected =
            question.type === "single"
              ? currentAnswers === option
              : (currentAnswers as string[])?.includes(option);

          return (
            <button
              key={index}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 group ${
                isSelected
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-gray-700"
              }`}
              onClick={() => handleAnswer(option)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm leading-relaxed">
                    {option}
                  </p>
                </div>

                {isSelected && question.type === "single" && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}

                {question.type === "multiple" && (
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded" />}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const progressPercentage =
    ((currentQuestion + 1) / quizQuestions.length) * 100;

  const currentQuestionData = quizQuestions[currentQuestion];

  const isCurrentQuestionAnswered =
    answers[currentQuestionData.id] !== undefined &&
    (!Array.isArray(answers[currentQuestionData.id]) ||
      (answers[currentQuestionData.id] as string[]).length > 0);

  const startQuiz = () => setShowWelcomePopup(false);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8 shadow-xl border-0 bg-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Let's Personalize Your Learning Journey
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                This short quiz helps us understand your learning preferences,
                goals, and style to create a truly personalized learning path.
              </p>

              <Button
                onClick={startQuiz}
                className="w-full gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Start Quiz <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MAIN QUIZ UI */}
      <div
        className={`max-w-6xl mx-auto transition-all duration-300 ${
          showWelcomePopup ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <div className="text-center mb-12">
          <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">
            Learning Preferences Quiz
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Help us create the perfect learning path by understanding your
            preferences and goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8 bg-white border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                    Your Progress
                  </h3>

                  <div className="relative w-32 h-32 mx-auto mb-6">
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
                        className="text-gray-200"
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
                        className="text-blue-600 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Question Navigation */}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-3">
                    Questions
                  </h4>

                  <div className="grid grid-cols-4 gap-2">
                    {quizQuestions.map((_, index) => (
                      <button
                        key={index}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                          index === currentQuestion
                            ? "bg-blue-600 text-white"
                            : answers[quizQuestions[index].id]
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                        onClick={() => setCurrentQuestion(index)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Quiz Content */}
          <div className="lg:col-span-3">
            <Card className="p-8 shadow-sm border-gray-200 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`p-3 rounded-xl ${categoryColors[currentQuestionData.category]}`}
                >
                  {currentQuestionData.icon}
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-2">
                    {categoryLabels[currentQuestionData.category]}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {currentQuestionData.question}
                  </h2>
                </div>
              </div>

              {/* Options */}
              <div className="min-h-[200px] mb-8">
                {renderOptions(currentQuestionData)}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="gap-2 px-6 py-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!isCurrentQuestionAnswered}
                  className="gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {currentQuestion === quizQuestions.length - 1
                    ? isSubmitting
                      ? "Saving..."
                      : "Complete Quiz"
                    : "Next Question"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
