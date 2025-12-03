// src/pages/AdaptiveQuizPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Rocket, Trophy, Brain, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api, DynamicQuizQuestion } from "@/lib/api";

type AnswerMap = Record<string, string>;

const AdaptiveQuizPage = () => {
  const [questions, setQuestions] = useState<DynamicQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 1. Fetch 10 dynamic questions from Python API
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        // handle both user._id and user.id just in case
        const userId = (user as any)?._id || (user as any)?.id;
        if (!userId) {
          throw new Error("User id is missing. Please log in again.");
        }

        const qs = await api.getDynamicQuiz(userId);
        setQuestions(qs);
      } catch (err: any) {
        console.error("Error loading dynamic quiz:", err);
        toast({
          title: "Error loading quiz",
          description:
            err?.message || "Could not generate personalized quiz. Try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [user, toast]);

  const handleAnswer = (value: string) => {
    const q = questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const handleNext = () => {
    const q = questions[currentIndex];
    if (!answers[q.id]) return; // don't allow skipping

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const dynamicQuizAnswers = questions.map((q) => ({
        questionId: q.id,
        question: q.question,
        options: q.options,
        answer: answers[q.id],
      }));

      await api.saveDynamicQuiz({
        dynamicQuizAnswers,
        dynamicQuizCompleted: true,
        dynamicQuizCompletedAt: new Date().toISOString(),
      });

      toast({
        title: "Adaptive quiz completed",
        description: "Your personalized responses have been saved.",
      });

      navigate("/learner/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Error saving dynamic quiz:", err);
      toast({
        title: "Error saving quiz",
        description:
          err?.message || "There was a problem saving your answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Result hexagon rendering values (derived from static quiz responses saved earlier)
  const categoryColors: Record<string, string> = {
    interest: "bg-rose-500 text-white",
    skills: "bg-amber-500 text-white",
    purpose: "bg-emerald-500 text-white",
    career: "bg-[hsl(var(--primary)/0.9)] text-white",
    personality: "bg-purple-500 text-white",
  };

  const categoryBgLight: Record<string, string> = {
    interest: "bg-rose-50/95 border-rose-200 text-rose-900 ring-rose-100",
    skills: "bg-amber-50/95 border-amber-200 text-amber-900 ring-amber-100",
    purpose: "bg-emerald-50/95 border-emerald-200 text-emerald-900 ring-emerald-100",
    career: "bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] ring-[hsl(var(--primary)/0.2)]",
    personality: "bg-purple-50/95 border-purple-200 text-purple-900 ring-purple-100",
  };

  // Pull static quiz responses from user context or localStorage fallback
  const resultsSummary = useMemo(() => {
    const categories = ["skills", "career", "interest", "purpose", "personality"];

    let quizResponses: any[] | null = null;
    const localProfileRaw = localStorage.getItem("userProfile");
    if (localProfileRaw) {
      try {
        const lp = JSON.parse(localProfileRaw);
        quizResponses = lp?.quizResponses || null;
      } catch {}
    }

    return categories.map((category) => {
      const entry = quizResponses?.find((r) => r.category === category);
      const answer = entry?.answer || "Not answered";

      let icon: any = <Sparkles className="w-5 h-5" />;
      let title = "Insight";
      if (category === "skills") {
        icon = <Rocket className="w-5 h-5" />;
        title = "Core Skills";
      } else if (category === "career") {
        icon = <Trophy className="w-5 h-5" />;
        title = "Primary Goal";
      } else if (category === "interest") {
        icon = <Brain className="w-5 h-5" />;
        title = "Learning Style";
      } else {
        icon = <Clock className="w-5 h-5" />;
        title = "Study Routine";
      }

      return { category, title, answer, icon };
    });
  }, []);

  const HexItem = ({ data, index, total }: { data: any; index: number; total: number }) => {
    const angle = index * (360 / total) - 90;
    const radius = 180;
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
        animate={{ opacity: 1, scale: 1, x, y }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`absolute w-44 p-4 rounded-xl shadow-lg border backdrop-blur-sm z-10 flex flex-col items-center text-center ${categoryBgLight[data.category]}`}
        style={{ marginLeft: -88, marginTop: -60 }}
      >
        <div className={`p-2 rounded-full mb-2 ${categoryColors[data.category]}`}>{data.icon}</div>
        <h3 className="font-bold text-xs uppercase tracking-wider mb-1 opacity-80">{data.title}</h3>
        <p className="text-xs font-semibold leading-tight line-clamp-2">{data.answer}</p>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-medium text-gray-800 mb-2">Crafting Your Personalized Quiz</p>
        <p className="text-sm text-gray-600 text-center max-w-md">
          Analyzing your previous answers to generate questions tailored just for you...
        </p>
      </div>
    );
  }

  if (!questions.length && !showResults) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg border border-gray-100">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Quiz Not Available</p>
          <p className="text-sm text-gray-600 mb-6">
            No personalized quiz is available right now. Please check back later.
          </p>
          <Button 
            onClick={() => navigate("/learner/dashboard", { replace: true })}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isAnswered = q ? !!answers[q.id] : false;

  // Question categories for visual enhancement
  const categories = [
    "Interests & Passion",
    "Skills & Strengths", 
    "Work Preferences",
    "Career Goals",
    "Learning Style"
  ];
  const currentCategory = categories[currentIndex % categories.length];

  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 overflow-x-hidden">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 z-10 relative max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "hsl(var(--primary))", filter: "brightness(0.6)" }}>
            Your Comprehensive Profile
          </h1>
          <p className="text-slate-600">We've analyzed your responses across 5 key dimensions to generate your unique learning DNA.</p>
        </motion.div>

        <div className="hidden md:flex relative w-[600px] h-[600px] items-center justify-center my-8">
          <svg className="absolute inset-0 w-full h-full text-slate-200" style={{ zIndex: 0 }}>
            <circle cx="300" cy="300" r="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="300" cy="300" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-20 w-32 h-32 bg-white rounded-full shadow-xl border-4 border-slate-100 flex items-center justify-center flex-col">
            <span className="text-3xl">🎯</span>
            <span className="text-xs font-bold text-slate-400 mt-1">YOU</span>
          </motion.div>
          {resultsSummary.map((item, index) => (
            <HexItem key={item.category} data={item} index={index} total={5} />
          ))}
        </div>

        <div className="md:hidden w-full max-w-sm flex flex-col gap-4 pb-12">
          {resultsSummary.map((item, index) => (
            <motion.div key={item.category} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${categoryBgLight[item.category]}`}>
              <div className={`p-2.5 rounded-full ${categoryColors[item.category]}`}>{item.icon}</div>
              <div>
                <h3 className="text-xs font-bold uppercase opacity-70 mb-0.5">{item.title}</h3>
                <p className="text-sm font-semibold">{item.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="relative z-50 md:-mt-12">
          <Button size="lg" onClick={handleSubmit} disabled={submitting} className="rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all bg-[hsl(var(--primary)/0.9)] hover:bg-[hsl(var(--primary))] text-white">
            {submitting ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Generate My Curriculum
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Personalized Career Discovery</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Adaptive Learning Quiz
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Answer honestly to refine your personalized learning and career path
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">{currentIndex + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Question</p>
                  <p className="font-semibold text-gray-900">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="font-semibold text-indigo-700">{currentCategory}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{Math.round(progress)}% Complete</span>
              <span>{currentIndex + 1}/{questions.length}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Question Dots */}
          <div className="flex flex-wrap gap-2 mt-4">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx <= currentIndex || answers[questions[idx]?.id]) {
                    setCurrentIndex(idx);
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${idx === currentIndex 
                    ? "bg-blue-600 text-white scale-110 shadow-lg" 
                    : answers[questions[idx]?.id]
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : idx < currentIndex
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
              >
                {answers[questions[idx]?.id] ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-6 md:p-8 bg-white border-0 rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Decorative Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="space-y-6 mb-8 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-700">Q</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    {currentCategory}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    {q.question}
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-gray-600 border-l-4 border-blue-200 pl-4 py-1 bg-blue-50/50 rounded-r">
              Choose the option that best describes you. Your answers will help us create a more accurate career path.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === opt;
              const letters = ["A", "B", "C", "D", "E", "F"];
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleAnswer(opt)}
                  className={`p-5 rounded-xl border-2 text-left transition-all duration-300 group relative overflow-hidden
                    ${selected
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]"
                    }`}
                >
                  {/* Option indicator */}
                  <div className={`absolute -left-3 top-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                    ${selected 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600" 
                      : "bg-gradient-to-r from-gray-400 to-gray-500"
                    }`}>
                    {letters[idx]}
                  </div>
                  
                  <div className="ml-8">
                    <p className={`font-medium text-base ${selected ? "text-blue-800" : "text-gray-800"}`}>
                      {opt}
                    </p>
                  </div>
                  
                  {/* Selection indicator */}
                  {selected && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0 || submitting}
              className="gap-2 px-6 py-3 rounded-lg border-gray-300 hover:border-blue-400"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isAnswered ? "✓ Ready to continue" : "Select an option to continue"}
              </p>
            </div>
            
            <Button
              onClick={handleNext}
              disabled={!isAnswered || submitting}
              className="gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              {currentIndex === questions.length - 1 ? "Complete Quiz" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            This quiz adapts based on your previous answers. Take your time and be honest for the best results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveQuizPage;
