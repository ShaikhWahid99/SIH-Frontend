import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Rocket,
  Trophy,
  Brain,
  Clock,
  ArrowRight,
  X as XIcon,
} from "lucide-react";
import { api, SwipeRequest, SwipeStage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo,
  useAnimation,
} from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Loader from "@/components/Loader";

type Rating = "like" | "dislike" | null;

const STAGES: SwipeStage[] = [
  "START",
  "BATCH_1",
  "BATCH_2",
  "BATCH_3",
  "BATCH_4",
];

// -----------------------------
// Motivational Messages (20)
// -----------------------------
const MOTIVATION: string[] = [
  "Great job! You're one step closer to mastering your future!",
  "Small steps today lead to big wins tomorrow!",
  "Amazing! Your journey just leveled up!",
  "Keep going! Success is built one milestone at a time!",
  "You’re doing awesome — stay unstoppable!",
  "This momentum is fire! Keep pushing!",
  "Your dedication is shaping your future!",
  "Every milestone completed is progress earned!",
  "Believe in yourself — you’re on the right track!",
  "Great progress! Your skills are growing with every step!",
  "This is how achievers rise. Keep going!",
  "You're building something incredible — stay focused!",
  "Milestone unlocked! The journey continues!",
  "Your hard work is paying off — don’t stop now!",
  "You're closer to your goals than you think!",
  "Each step forward is a victory. Well done!",
  "Your potential is limitless — keep moving!",
  "Progress looks good on you!",
  "You're crushing it — keep the energy alive!",
  "Milestone complete! Time to shine even brighter!",
];

const TIMELINE_TOTAL = 10;
// milestone thresholds (global answered counts after which to fire toast)
const MILESTONE_THRESHOLDS = [3, 6, 8, 10]; // matches batches: 3,3,2,2

const SwipeQuizPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();

  // --- QUIZ STATE ---
  const [currentStage, setCurrentStage] = useState<SwipeStage>("START");
  const [cards, setCards] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  // Hand hint animation
  const [showHandHint, setShowHandHint] = useState(true);

  // --- UI STATE ---
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [batchesCompleted, setBatchesCompleted] = useState<number>(0);
  const [nextStageHint, setNextStageHint] = useState<SwipeStage | undefined>(
    undefined
  );
  const [isDoneHint, setIsDoneHint] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [savedLikes, setSavedLikes] = useState<string[]>([]);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  // --- GLOBAL TIMELINE STATE ---
  // stores the user's answer for each of the 10 timeline slots in order
  const [globalRatings, setGlobalRatings] = useState<Rating[]>(() =>
    Array(TIMELINE_TOTAL).fill(null)
  );
  const [answeredCount, setAnsweredCount] = useState<number>(0); // how many questions answered globally

  // --- RESULTS STATE ---
  const [showResults, setShowResults] = useState(false);

  // --- STREAMING STATE ---
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [streamStatus, setStreamStatus] = useState<
    "idle" | "streaming" | "done" | "error"
  >("idle");
  const [streamResult, setStreamResult] = useState<any>(null);

  // --- ANIMATION CONTROLS ---
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  // Background Icon Animations (for left/right drag)
  const trashScale = useTransform(x, [-150, 0], [1.2, 1]);
  const trashColor = useTransform(x, [-150, -50], ["#f43f5e", "#cbd5e1"]);
  const trashOpacity = useTransform(x, [-150, -20], [1, 0.5]);

  const checkScale = useTransform(x, [0, 150], [1, 1.2]);
  const checkColor = useTransform(x, [50, 150], ["#cbd5e1", "#10b981"]);
  const checkOpacity = useTransform(x, [20, 150], [0.5, 1]);

  // Swipe overlay icon opacities (show while dragging)
  const rightOpacity = useTransform(x, [20, 150], [0, 1]);
  const leftOpacity = useTransform(x, [-150, -20], [1, 0]);

  const allRated = useMemo(
    () => cards.length > 0 && ratings.every((r) => r !== null),
    [cards, ratings]
  );

  // --- RESULTS SUMMARY (from AdaptiveQuiz) ---
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
      // const answer = entry?.answer || "Not answered";

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

      return { category, title, icon };
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

  useEffect(() => {
    // load first batch
    loadBatch("START", [], []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOGIC: LOAD CARDS ---
  const loadBatch = async (
    stage: SwipeStage,
    likedCards: string[],
    dislikedCards: string[]
  ) => {
    let uid = user?.userDetails?._id as string | undefined;
    if (!uid) {
      const refreshed = await refreshUser();
      uid = refreshed?.userDetails?._id as string | undefined;
    }
    if (!uid) {
      toast({
        title: "Auth Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      navigate("/auth/login", { replace: true });
      return;
    }
    setLoading(stage === "START");
    try {
      const body: SwipeRequest = {
        user_id: String(uid),
        current_stage: stage,
        liked_cards: likedCards,
        disliked_cards: dislikedCards,
      };
      const res = await api.getSwipeLogic(body);
      setCards(res.cards || []);
      setRatings(
        Array.from({ length: (res.cards || []).length }).map(() => null)
      );
      setCurrentStage(stage);
      setNextStageHint(res.next_stage);
      setIsDoneHint(Boolean(res.done));
      setCurrentCardIndex(0);
      x.set(0);
    } catch (err: unknown) {
      console.error("Swipe logic error", err);
      toast({
        title: "Error",
        description: "Could not load quiz cards.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (stage === "START") setInitialLoad(false);
    }
  };

  // --- STREAMING RECOMMENDATION (from AdaptiveQuiz) ---
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

  // --- LOGIC: SUBMIT FINAL ---
  const finalizeQuiz = async (
    answers: { question: string; answer: string }[]
  ) => {
    setSubmitting(true);
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) throw new Error("User id is missing. Please log in again.");

      // Start recommendation stream
      const recData = await startRecommendationStream(userId);
      if (!recData) throw new Error("No recommendation data received");

      // Save quiz data
      await api.saveDynamicQuiz({
        dynamicQuizAnswers: answers,
        dynamicQuizCompleted: true,
        dynamicQuizCompletedAt: new Date().toISOString(),
      });

      await refreshUser();
      navigate("/learner/dashboard", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not save.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // --- LOGIC: CARD INTERACTIONS ---
  const handleRate = async (index: number, value: Exclude<Rating, null>) => {
    // Animation for button clicks / snap away
    if (x.get() === 0) {
      await controls.start({
        x: value === "like" ? 200 : -200,
        y: 50,
        rotate: value === "like" ? 45 : -45,
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3, ease: "backIn" },
      });
    }

    // If this index was previously unanswered, increment global answered count and set globalRatings
    setRatings((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    // Update globalRatings in order (append at current answeredCount position)
    setGlobalRatings((prevGlobal) => {
      const nextGlobal = [...prevGlobal];
      // find first null slot (we assume sequential answering)
      const slot = nextGlobal.findIndex((r) => r === null);
      const useSlot = slot === -1 ? nextGlobal.length : slot;
      if (useSlot < TIMELINE_TOTAL) {
        nextGlobal[useSlot] = value;
      }
      return nextGlobal;
    });

    // increment answeredCount if we filled a previously empty slot
    setAnsweredCount((prev) => {
      const newCount = prev < TIMELINE_TOTAL ? prev + 1 : prev;
      // check milestone thresholds and toast if matches
      if (MILESTONE_THRESHOLDS.includes(newCount)) {
        const milestoneIndex = MILESTONE_THRESHOLDS.indexOf(newCount) + 1; // 1..4
        const msg = MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
        toast({
          title: `Milestone ${milestoneIndex} Completed!`,
          description: msg,
        });
      }
      return newCount;
    });

    // save likes immediately if liked
    const text = cards[index];
    if (value === "like" && text && !savedLikes.includes(text)) {
      setSavedLikes((s) => [...s, text]);
      api
        .saveDynamicQuiz({
          dynamicQuizAnswers: [{ question: text, answer: "like" }],
        })
        .catch(() => {});
    }

    // move to next card after a tiny delay
    setTimeout(() => {
      if (index < cards.length - 1) {
        setCurrentCardIndex(index + 1);
        x.set(0);
        controls.set({ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 });
      } else {
        // if this batch finished, trigger goNext logic which will load next batch
        // note: goNext checks allRated; ratings updated above so allRated may become true
        // small timeout to allow ratings state to update then call goNext
        setTimeout(() => {
          if (allRated) goNext();
        }, 150);
      }
    }, 120);
  };

  const onDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleRate(currentCardIndex, "like");
    } else if (info.offset.x < -threshold) {
      handleRate(currentCardIndex, "dislike");
    } else {
      controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  const goNext = async () => {
    // only proceed when the current batch's cards have been rated
    if (!allRated || submitting) return;
    const likedBatch = cards.filter((_, i) => ratings[i] === "like");
    const nextLiked = [...liked, ...likedBatch];

    const nextIndex = STAGES.indexOf(currentStage) + 1;
    const defaultNext = STAGES[nextIndex];
    const nextStage = nextStageHint ?? defaultNext;

    if (!nextStage || isDoneHint || batchesCompleted + 1 >= 4) {
      setLiked(nextLiked);
      await handleFinalSubmit();
      return;
    }

    setLiked(nextLiked);
    setBatchesCompleted((n) => n + 1);
    await loadBatch(nextStage, nextLiked, []);
  };

  const handleFinalSubmit = async () => {
    const likes = Array.from(new Set([...savedLikes, ...liked]));
    const dynamicQuizAnswers = likes.map((text) => ({
      question: text,
      answer: "like",
    }));
    await finalizeQuiz(dynamicQuizAnswers);
  };

  useEffect(() => {
    if (
      ratings.length > 0 &&
      currentCardIndex === cards.length - 1 &&
      ratings[currentCardIndex] !== null
    ) {
      const timeout = setTimeout(() => {
        goNext();
      }, 300);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratings, currentCardIndex]);

  // --- RENDER: LOADING ---
  if (loading && !showResults && initialLoad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans px-4">
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

  // --- RENDER: NO CARDS ---
  if (!cards.length && !showResults) {
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

  // --- RENDER: RESULTS PAGE ---
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

        {/* Desktop Hexagon Layout */}
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

        {/* Mobile List Layout */}
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
                {/* <p className="text-sm font-semibold">{item.answer}</p> */}
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
            onClick={handleFinalSubmit}
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

        {/* Stream Dialog */}
        <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <DialogTitle>Generating your curriculum</DialogTitle>
              </div>
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

  // --- RENDER: SWIPE CARDS WITH TIMELINE ---
  const progress = (currentCardIndex / Math.max(cards.length, 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center overflow-hidden relative font-sans text-slate-900">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50 to-slate-100 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md h-[100dvh] flex flex-col p-4">
        {/* ---------- GLOBAL 10-Q TIMELINE ---------- */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2 text-center">
            Quiz Timeline
          </h2>
          <div className="flex items-center justify-between gap-2 px-1">
            {Array.from({ length: TIMELINE_TOTAL }).map((_, i) => {
              const r = globalRatings[i];
              const idx = i + 1;
              const isAnswered = r !== null;
              const bg =
                r === "like"
                  ? "bg-emerald-500"
                  : r === "dislike"
                  ? "bg-rose-500"
                  : "bg-white";
              const border = r ? "" : "border border-slate-200";
              return (
                <div key={i} className="flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${bg} text-white ${
                        !r ? "text-slate-600" : ""
                      } ${border}`}
                    >
                      {r ? (
                        r === "like" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XIcon className="w-4 h-4" />
                        )
                      ) : (
                        <span className="text-xs font-semibold">{idx}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Q{idx}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Milestone labels under timeline */}
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 px-2">
            {/* <div>Milestone 1 </div>
            <div>Milestone 2</div>
            <div>Milestone 3 </div>
            <div>Milestone 4 </div> */}
          </div>
        </div>

        {/* HEADER */}
        <div className="flex-none pt-2 pb-2 z-20">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end px-1">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  Discover You
                </h1>
                {/* <p className="text-slate-500 text-sm font-medium">Batch {batchesCompleted + 1} of 4</p> */}
              </div>
            </div>
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 relative flex items-center justify-center my-3">
          <div className="relative w-full h-full max-h-[500px]">
            {/* Background Icons */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-0 px-4">
              <motion.div
                style={{
                  scale: trashScale,
                  color: trashColor,
                  opacity: trashOpacity,
                }}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 rounded-full border-4 border-current flex items-center justify-center bg-white/50 backdrop-blur-sm shadow-sm">
                  <Trash2 className="w-10 h-10" />
                </div>
              </motion.div>
              <motion.div
                style={{
                  scale: checkScale,
                  color: checkColor,
                  opacity: checkOpacity,
                }}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 rounded-full border-4 border-current flex items-center justify-center bg-white/50 backdrop-blur-sm shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </motion.div>
            </div>

            {/* Swipe overlay icons (left/red, right/green) */}
            <motion.div
              style={{ opacity: rightOpacity }}
              className="absolute right-6 top-6 z-30"
            >
              <div className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-full shadow-lg">
                <CheckCircle2 className="w-5 h-5 " />
                <span className="text-xs font-semibold">Agree</span>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: leftOpacity }}
              className="absolute left-6 top-6 z-30"
            >
              <div className="flex items-center gap-2 bg-rose-600 text-white px-3 py-2 rounded-full shadow-lg">
                <XIcon className="w-5 h-5" />
                <span className="text-xs font-semibold">Disagree</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {cards
                .slice(currentCardIndex, currentCardIndex + 2)
                .reverse()
                .map((cardText, i) => {
                  const isTopCard =
                    i === 1 || cards.length - currentCardIndex === 1;
                  return (
                    <motion.div
                      key={cardText}
                      style={{
                        x: isTopCard ? x : 0,
                        rotate: isTopCard ? rotate : 0,
                        zIndex: isTopCard ? 20 : 10,
                        scale: isTopCard ? 1 : 0.95,
                      }}
                      drag={isTopCard ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.6}
                      onDragEnd={onDragEnd}
                      animate={controls}
                      initial={{ scale: 0.9, opacity: 0, y: 30 }}
                      whileInView={{
                        scale: isTopCard ? 1 : 0.95,
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 25,
                      }}
                      className={`absolute inset-0 w-full h-full bg-white rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 ${
                        !isTopCard
                          ? "bg-slate-50 border-slate-200"
                          : "border-slate-100"
                      }`}
                    >
                      <h3 className="text-2xl font-bold text-slate-800 leading-snug select-none">
                        {cardText}
                      </h3>
                      {isTopCard && (
                        <div className="absolute bottom-6 flex items-center gap-8">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 text-sm font-bold uppercase tracking-widest">
                              Disagree
                            </span>
                            <span className="text-slate-400 font-bold">←</span>
                          </div>
                          <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">
                            Swipe
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">→</span>

                            <span className="text-slate-300 text-sm font-bold uppercase tracking-widest">
                              Agree
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex-none pb-6 pt-2 flex justify-center items-center gap-8 z-20">
          <Button
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-rose-100 bg-white text-rose-500 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-transform active:scale-95"
            onClick={() => handleRate(currentCardIndex, "dislike")}
            disabled={currentCardIndex >= cards.length}
          >
            <Trash2 className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            onClick={() => {
              if (currentCardIndex > 0) {
                setCurrentCardIndex((i) => i - 1);
                x.set(0);
                controls.set({ x: 0, scale: 1, opacity: 1, rotate: 0 });
              }
            }}
            disabled={currentCardIndex === 0}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-emerald-100 bg-white text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-transform active:scale-95"
            onClick={() => handleRate(currentCardIndex, "like")}
            disabled={currentCardIndex >= cards.length}
          >
            <CheckCircle2 className="w-7 h-7" />
          </Button>
        </div>
      </div>
      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              <DialogTitle>Generating your curriculum</DialogTitle>
            </div>
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
              onClick={() => navigate("/learner/dashboard", { replace: true })}
              disabled={streamStatus !== "done" || !streamResult}
            >
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const handAnimationStyles = `
@keyframes handSwipeRight {
  0% { transform: translateX(0); opacity: 1; }
  40% { transform: translateX(60px); opacity: 1; }
  50% { opacity: 1; }
}

@keyframes handSwipeLeft {
  0% { transform: translateX(60px); opacity: 1; }
  40% { transform: translateX(0); opacity: 1; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
`;

export default SwipeQuizPage;
