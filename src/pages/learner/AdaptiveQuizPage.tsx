// src/pages/AdaptiveQuizPage.tsx
import { useEffect, useState, useRef, useMemo } from "react";

import { motion } from "framer-motion";

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Rocket,
  Trophy,
  Brain,
  Clock,
  ArrowRight,
} from "lucide-react";

import Loader from "@/components/Loader";

import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  const [showResults, setShowResults] = useState(false);
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [streamStatus, setStreamStatus] = useState<
    "idle" | "streaming" | "done" | "error"
  >("idle");
  const [streamResult, setStreamResult] = useState<any>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const userId = (user as any)?._id || (user as any)?.id;
        if (!userId)
          throw new Error("User id is missing. Please log in again.");
        const qs = await api.getDynamicQuiz(userId);
        setQuestions(qs);
      } catch (err: any) {
        console.error("Error loading dynamic quiz:", err);
        toast({
          title: "Error loading quiz",
          description:
            err?.message ||
            "Could not generate personalized quiz. Try again later.",
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
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const startRecommendationStream = async (userId: string) => {
    try {
      setShowStreamDialog(true);
      setStreamStatus("streaming");
      setStreamLogs([]);
      setStreamResult(null);

      const res = await fetch(
        "https://imran-decoder-rec-jobs.hf.space/api/recommend/stream",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!res.ok) {
        throw new Error(`Stream request failed (${res.status})`);
      }
      if (!res.body) {
        throw new Error("Streaming response body is unavailable");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx = buffer.indexOf("\n");
        while (idx !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (line) {
            try {
              const obj = JSON.parse(line);
              if (obj.type === "log" && obj.message) {
                setStreamLogs((prev) => [...prev, obj.message]);
              } else if (obj.type === "result" && obj.data) {
                finalResult = obj.data;
                setStreamResult(obj.data);
              }
            } catch {}
          }
          idx = buffer.indexOf("\n");
        }
      }

      setStreamStatus("done");
      return finalResult;
    } catch (error: any) {
      console.error("Recommendation stream error:", error);
      setStreamStatus("error");
      toast({
        title: "Recommendation failed",
        description: error?.message || "Could not generate recommendations.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) throw new Error("User id is missing. Please log in again.");

      const recData = await startRecommendationStream(userId);
      if (!recData) throw new Error("No recommendation data received");

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

      // toast({
      //   title: "Curriculum generated",
      //   description: "Recommendations ready. Proceeding to dashboard.",
      // });

      navigate("/learner/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Error during submit:", err);
      toast({
        title: "Error",
        description: err?.message || "Something went wrong.",
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
    purpose:
      "bg-emerald-50/95 border-emerald-200 text-emerald-900 ring-emerald-100",
    career:
      "bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] ring-[hsl(var(--primary)/0.2)]",
    personality:
      "bg-purple-50/95 border-purple-200 text-purple-900 ring-purple-100",
  };

  // Pull static quiz responses from user context or localStorage fallback
  const resultsSummary = useMemo(() => {
    const categories = [
      "skills",
      "career",
      "interest",
      "purpose",
      "personality",
    ];

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

  const HexItem = ({
    data,
    index,
    total,
  }: {
    data: any;
    index: number;
    total: number;
  }) => {
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
        className={`absolute w-44 p-4 rounded-xl shadow-lg border backdrop-blur-sm z-10 flex flex-col items-center text-center ${
          categoryBgLight[data.category]
        }`}
        style={{ marginLeft: -88, marginTop: -60 }}
      >
        <div
          className={`p-2 rounded-full mb-2 ${categoryColors[data.category]}`}
        >
          {data.icon}
        </div>
        <h3 className="font-bold text-xs uppercase tracking-wider mb-1 opacity-80">
          {data.title}
        </h3>
        <p className="text-xs font-semibold leading-tight line-clamp-2">
          {data.answer}
        </p>
      </motion.div>
    );
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
          Analyzing your learning patterns to generate tailored questions — this
          should only take a moment.
        </p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Quiz Not Available
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            No personalized quiz is available right now. Please check back
            later.
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

  // Question categories for visual enhancement
  const categories = [
    "Interests & Passion",
    "Skills & Strengths",
    "Work Preferences",
    "Career Goals",
    "Learning Style",
  ];
  const currentCategory = categories[currentIndex % categories.length];

  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 z-10 relative max-w-2xl"
        >
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "hsl(var(--primary))", filter: "brightness(0.6)" }}
          >
            Your Comprehensive Profile
          </h1>
          <p className="text-slate-600">
            We've analyzed your responses across 5 key dimensions to generate
            your unique learning DNA.
          </p>
        </motion.div>

        <div className="hidden md:flex relative w-[600px] h-[600px] items-center justify-center my-8">
          <svg
            className="absolute inset-0 w-full h-full text-slate-200"
            style={{ zIndex: 0 }}
          >
            <circle
              cx="300"
              cy="300"
              r="180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle
              cx="300"
              cy="300"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-20 w-32 h-32 bg-white rounded-full shadow-xl border-4 border-slate-100 flex items-center justify-center flex-col"
          >
            <span className="text-3xl">🎯</span>
            <span className="text-xs font-bold text-slate-400 mt-1">YOU</span>
          </motion.div>
          {resultsSummary.map((item, index) => (
            <HexItem key={item.category} data={item} index={index} total={5} />
          ))}
        </div>

        <div className="md:hidden w-full max-w-sm flex flex-col gap-4 pb-12">
          {resultsSummary.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${
                categoryBgLight[item.category]
              }`}
            >
              <div
                className={`p-2.5 rounded-full ${
                  categoryColors[item.category]
                }`}
              >
                {item.icon}
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase opacity-70 mb-0.5">
                  {item.title}
                </h3>
                <p className="text-sm font-semibold">{item.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative z-50 md:-mt-12"
        >
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all bg-[hsl(var(--primary)/0.9)] hover:bg-[hsl(var(--primary))] text-white"
          >
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

        <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
          <DialogContent>
            <DialogHeader>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              <DialogTitle>Generating your curriculum</DialogTitle>
              <DialogDescription>
                Live logs from the recommendation engine
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-64 overflow-auto border rounded-md p-3 bg-muted/30">
              {streamLogs.length === 0 && (
                <div className="text-sm text-muted-foreground">Starting...</div>
              )}
              {streamLogs.map((msg, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {streamStatus === "streaming" && "Streaming..."}
                {streamStatus === "done" && "Completed"}
                {streamStatus === "error" && "Failed"}
              </div>
              <Button
                onClick={() =>
                  navigate("/learner/dashboard", { replace: true })
                }
                disabled={streamStatus !== "done" || !streamResult}
              >
                Go to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-600 font-medium">
              Personalized Career Discovery
            </span>
          </div>

          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Adaptive Learning Quiz
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Answer honestly to refine your personalized learning and career
            path.
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
                  <p className="text-sm font-medium text-slate-700">
                    {currentCategory}
                  </p>
                </div>
              </div>

              {/* progress */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>{Math.round(progress)}% Complete</span>
                  <span>
                    {currentIndex + 1}/{questions.length}
                  </span>
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
                        setCurrentIndex(idx);
                        // if (idx <= currentIndex || answers[questions[idx]?.id]) {
                        // }
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
                This quiz adapts based on your responses. You can review
                answered questions but cannot proceed without selecting an
                option.
              </p>
            </div>
          </aside>

          {/* Right column - question card */}
          <main className="lg:col-span-8">
            <Card
              ref={cardRef}
              className="p-6 md:p-8 bg-white border border-slate-100 rounded-2xl shadow"
            >
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
                Choose the option that best describes you. Your answers will
                help us create a more accurate career path.
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
                          (selected
                            ? "bg-slate-900 text-white"
                            : "bg-slate-200 text-slate-700")
                        }
                      >
                        {letters[idx]}
                      </div>

                      <div className="flex-1">
                        <p
                          className={
                            "text-sm font-medium " +
                            (selected ? "text-slate-900" : "text-slate-800")
                          }
                        >
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
                  {isAnswered
                    ? "✓ Ready to continue"
                    : "Select an option to continue"}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isAnswered || submitting}
                  className="px-4 py-2"
                >
                  <span className="mr-2">
                    {currentIndex === questions.length - 1
                      ? "Complete Quiz"
                      : "Next"}
                  </span>
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
