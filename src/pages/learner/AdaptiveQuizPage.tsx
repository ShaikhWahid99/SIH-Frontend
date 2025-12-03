// src/pages/AdaptiveQuizPage.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import "@/styles/ghost-loader.css";
import Loader from "@/components/Loader";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api, DynamicQuizQuestion } from "@/lib/api";

type AnswerMap = Record<string, string>;

const categories = [
  "Interests & Passion",
  "Skills & Strengths",
  "Work Preferences",
  "Career Goals",
  "Learning Style",
];

const AdaptiveQuizPage = () => {
  const [questions, setQuestions] = useState<DynamicQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const userId = (user as any)?._id || (user as any)?.id;
        if (!userId) throw new Error("User id is missing. Please log in again.");
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

  // scroll card into view when question changes (small UX improvement)
  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentIndex]);

  const handleAnswer = (value: string) => {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const handleNext = () => {
    const q = questions[currentIndex];
    if (!q || !answers[q.id]) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
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

  // Loading screen (minimal)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="mb-8">
          <Loader />
        </div>

        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Crafting your personalized quiz
        </h2>
        <p className="text-slate-600 max-w-md text-center">
          Analyzing your learning patterns to generate tailored questions —
          this should only take a moment.
        </p>
      </div>
    );
  }

  // No questions found
  if (!questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Quiz Not Available</h3>
          <p className="text-sm text-slate-600 mb-6">
            No personalized quiz is available right now. Please check back later.
          </p>
          <Button
            onClick={() => navigate("/learner/dashboard", { replace: true })}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = !!answers[q.id];
  const currentCategory = categories[currentIndex % categories.length];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-600 font-medium">Personalized Career Discovery</span>
          </div>

          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Adaptive Learning Quiz</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Answer honestly to refine your personalized learning and career path.
          </p>
        </div>

        {/* Main container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left column - progress + dots */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500">Question</p>
                  <p className="text-lg font-medium text-slate-900">
                    {currentIndex + 1} of {questions.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="text-sm font-medium text-slate-700">{currentCategory}</p>
                </div>
              </div>

              {/* progress */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>{Math.round(progress)}% Complete</span>
                  <span>{currentIndex + 1}/{questions.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg, rgba(15,23,42,1) 0%, rgba(100,116,139,0.9) 100%)",
                    }}
                  />
                </div>
              </div>

              {/* dots */}
              <div className="mt-4 grid grid-cols-6 gap-2">
                {questions.map((_, idx) => {
                  const state = answers[questions[idx]?.id]
                    ? "completed"
                    : idx === currentIndex
                    ? "current"
                    : idx < currentIndex
                    ? "visited"
                    : "future";
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (idx <= currentIndex || answers[questions[idx]?.id]) {
                          setCurrentIndex(idx);
                        }
                      }}
                      aria-label={`Go to question ${idx + 1}`}
                      className={
                        "w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center transition " +
                        (state === "current"
                          ? "bg-slate-900 text-white scale-105 shadow"
                          : state === "completed"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : state === "visited"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-white text-slate-400 border border-slate-100")
                      }
                    >
                      {answers[questions[idx]?.id] ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* small help */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-sm text-slate-600 shadow-sm">
              <p>
                This quiz adapts based on your responses. You can review answered
                questions but cannot proceed without selecting an option.
              </p>
            </div>
          </aside>

          {/* Right column - question card */}
          <main className="lg:col-span-8">
            <Card ref={cardRef} className="p-6 md:p-8 bg-white border border-slate-100 rounded-2xl shadow">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="font-semibold text-slate-800">Q</span>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {currentCategory}
                    </p>
                    <h2 className="text-xl font-medium text-slate-900 leading-tight">
                      {q.question}
                    </h2>
                  </div>
                </div>

                <div className="text-sm text-slate-500">
                  <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    {currentIndex + 1}/{questions.length}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 border-l-2 border-slate-100 pl-4">
                Choose the option that best describes you. Your answers will help us
                create a more accurate career path.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {q.options.map((opt, idx) => {
                  const selected = answers[q.id] === opt;
                  const letters = ["A", "B", "C", "D", "E", "F"];
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswer(opt)}
                      className={
                        "relative rounded-xl p-4 text-left border transition-shadow duration-200 flex items-start gap-3 " +
                        (selected
                          ? "bg-slate-50 border-slate-200 shadow-sm scale-[1.01]"
                          : "bg-white border-slate-100 hover:shadow-sm")
                      }
                      aria-pressed={selected}
                    >
                      <div
                        className={
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold " +
                          (selected ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700")
                        }
                      >
                        {letters[idx]}
                      </div>

                      <div className="flex-1">
                        <p className={"text-sm font-medium " + (selected ? "text-slate-900" : "text-slate-800")}>
                          {opt}
                        </p>
                      </div>

                      {selected && (
                        <div className="ml-3 mt-1">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <CheckCircle className="w-4 h-4 text-emerald-700" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0 || submitting}
                  className="px-4 py-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="ml-2">Previous</span>
                </Button>

                <div className="text-sm text-slate-600">
                  {isAnswered ? "✓ Ready to continue" : "Select an option to continue"}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isAnswered || submitting}
                  className="px-4 py-2"
                >
                  <span className="mr-2">{currentIndex === questions.length - 1 ? "Complete Quiz" : "Next"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveQuizPage;
