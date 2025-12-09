import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  RotateCcw,
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import Loader from "@/components/Loader"; // Ensure this component exists
import { api, SwipeRequest, SwipeStage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  AnimatePresence, 
  PanInfo,
  useAnimation
} from "framer-motion";

type Rating = "like" | "dislike" | null;

const STAGES: SwipeStage[] = ["START", "BATCH_1", "BATCH_2", "BATCH_3", "BATCH_4"];

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
  
  // --- UI STATE ---
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [batchesCompleted, setBatchesCompleted] = useState<number>(0);
  const [nextStageHint, setNextStageHint] = useState<SwipeStage | undefined>(undefined);
  const [isDoneHint, setIsDoneHint] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [savedLikes, setSavedLikes] = useState<string[]>([]);
  
  // --- FINAL STEP STATE ---
  const [showDescriptionStep, setShowDescriptionStep] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");

  // --- STREAMING STATE (From AdaptiveQuiz) ---
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [streamStatus, setStreamStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [streamResult, setStreamResult] = useState<any>(null);

  // --- ANIMATION CONTROLS ---
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]); 
  
  // Background Icon Animations
  const trashScale = useTransform(x, [-150, 0], [1.2, 1]);
  const trashColor = useTransform(x, [-150, -50], ["#f43f5e", "#cbd5e1"]);
  const trashOpacity = useTransform(x, [-150, -20], [1, 0.5]);

  const checkScale = useTransform(x, [0, 150], [1, 1.2]);
  const checkColor = useTransform(x, [50, 150], ["#cbd5e1", "#10b981"]);
  const checkOpacity = useTransform(x, [20, 150], [0.5, 1]);

  const allRated = useMemo(() => cards.length > 0 && ratings.every((r) => r !== null), [cards, ratings]);

  useEffect(() => {
    loadBatch("START", [], []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOGIC: LOAD CARDS ---
  const loadBatch = async (stage: SwipeStage, likedCards: string[], dislikedCards: string[]) => {
    let uid = user?.userDetails?._id as string | undefined;
    if (!uid) {
      const refreshed = await refreshUser();
      uid = refreshed?.userDetails?._id as string | undefined;
    }
    if (!uid) {
      toast({ title: "Auth Error", description: "Please log in again.", variant: "destructive" });
      navigate("/auth/login", { replace: true });
      return;
    }
    setLoading(true);
    try {
      const body: SwipeRequest = {
        user_id: String(uid),
        current_stage: stage,
        liked_cards: likedCards,
        disliked_cards: dislikedCards,
      };
      const res = await api.getSwipeLogic(body);
      setCards(res.cards || []);
      setRatings(Array.from({ length: (res.cards || []).length }).map(() => null));
      setCurrentStage(stage);
      setNextStageHint(res.next_stage);
      setIsDoneHint(Boolean(res.done));
      setCurrentCardIndex(0);
      x.set(0);
    } catch (err: unknown) {
      console.error("Swipe logic error", err);
      toast({ title: "Error", description: "Could not load quiz cards.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: STREAM GENERATION (Ported from AdaptiveQuiz) ---
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

      if (!res.ok) throw new Error(`Stream request failed (${res.status})`);
      if (!res.body) throw new Error("Streaming response body is unavailable");

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
      console.error("Stream error:", error);
      setStreamStatus("error");
      toast({
        title: "Generation failed",
        description: error?.message || "Could not generate recommendations.",
        variant: "destructive",
      });
      return null;
    }
  };

  // --- LOGIC: SUBMIT FINAL (Triggered by Finish Button) ---
  const handleFinalSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    
    try {
      let uid = user?.userDetails?._id as string | undefined;
      if (!uid) {
         const refreshed = await refreshUser();
         uid = refreshed?.userDetails?._id as string | undefined;
      }
      if (!uid) throw new Error("User ID missing");

      // 1. Start the Visual Stream
      const recData = await startRecommendationStream(uid);
      if (!recData && streamStatus === 'error') throw new Error("Recommendation failed");

      // 2. Save Quiz Data
      const dynamicQuizAnswers = [
        ...savedLikes.map((text) => ({ question: text, answer: "like" })),
        { question: "Self Description", answer: description.trim(), category: "description" },
      ];
      
      await api.saveDynamicQuiz({ 
          dynamicQuizAnswers, 
          careerGoal: description.trim(),
          dynamicQuizCompleted: true,
          dynamicQuizCompletedAt: new Date().toISOString()
      });
      
      await refreshUser();
      
      // 3. Navigate (Delay slightly so user sees 'Completed')
      setTimeout(() => {
        navigate("/learner/dashboard", { replace: true });
      }, 1500);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not save.";
      toast({ title: "Error", description: message, variant: "destructive" });
      setShowStreamDialog(false); // Close dialog on hard error so user can retry
    } finally {
      setSubmitting(false);
    }
  };

  // --- LOGIC: CARD INTERACTIONS ---
  const handleRate = async (index: number, value: Exclude<Rating, null>) => {
    // Animation for button clicks
    if (x.get() === 0) {
        await controls.start({
            x: value === "like" ? 200 : -200,
            y: 50,
            rotate: value === "like" ? 45 : -45,
            scale: 0,
            opacity: 0,
            transition: { duration: 0.3, ease: "backIn" }
        });
    }

    setRatings((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    const text = cards[index];
    if (value === "like" && text && !savedLikes.includes(text)) {
      setSavedLikes((s) => [...s, text]);
      api.saveDynamicQuiz({ dynamicQuizAnswers: [{ question: text, answer: "like" }] }).catch(() => {});
    }
    
    setTimeout(() => {
        if (index < cards.length - 1) {
            setCurrentCardIndex(index + 1);
            x.set(0);
            controls.set({ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 });
        }
    }, 100); 
  };

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleRate(currentCardIndex, "like");
    } else if (info.offset.x < -threshold) {
      handleRate(currentCardIndex, "dislike");
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const goNext = async () => {
    if (!allRated || submitting) return;
    const likedBatch = cards.filter((_, i) => ratings[i] === "like");
    const dislikedBatch = cards.filter((_, i) => ratings[i] === "dislike");
    const nextLiked = [...liked, ...likedBatch];
    const nextDisliked = [...disliked, ...dislikedBatch];

    const nextIndex = STAGES.indexOf(currentStage) + 1;
    const defaultNext = STAGES[nextIndex];
    const nextStage = nextStageHint ?? defaultNext;

    if (!nextStage || isDoneHint || batchesCompleted + 1 >= 4) {
      const totalLikes = Math.max(nextLiked.length, savedLikes.length);
      // Force description step if likes are low, otherwise just show it as final step
      setShowDescriptionStep(true);
      return;
    }

    setLiked(nextLiked);
    setDisliked(nextDisliked);
    setBatchesCompleted((n) => n + 1);
    await loadBatch(nextStage, nextLiked, nextDisliked);
  };

  useEffect(() => {
     if (ratings.length > 0 && currentCardIndex === cards.length - 1 && ratings[currentCardIndex] !== null) {
        const timeout = setTimeout(() => {
            goNext();
        }, 300);
        return () => clearTimeout(timeout);
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratings, currentCardIndex]);

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full mb-4"
        />
        <p className="text-slate-500 font-medium">Preparing your cards...</p>
      </div>
    );
  }

  const progress = ((currentCardIndex) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center overflow-hidden relative font-sans text-slate-900">
      
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50 to-slate-100 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md h-[100dvh] flex flex-col p-4">
        
        {/* HEADER */}
        <div className="flex-none pt-4 pb-2 z-20">
            {!showDescriptionStep && (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end px-1">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Discover You</h1>
                            <p className="text-slate-500 text-sm font-medium">Batch {batchesCompleted + 1} of 4</p>
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
            )}
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 relative flex items-center justify-center my-4">
            
            {showDescriptionStep ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col z-30"
                >
                     <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Final Step</h2>
                    <p className="text-slate-500 mb-6">Describe your ideal career path or interests to generate your curriculum.</p>
                    <Textarea
                        placeholder="I want to learn..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex-1 min-h-[120px] bg-slate-50 border-slate-200 rounded-xl p-4 mb-6"
                    />
                    <Button 
                        size="lg"
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-14"
                        onClick={handleFinalSubmit}
                        disabled={submitting || !description.trim()}
                    >
                        {submitting ? "Starting..." : "Generate Curriculum"}
                    </Button>
                </motion.div>
            ) : (
                <div className="relative w-full h-full max-h-[500px]">
                    {/* Background Icons */}
                    <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-0 px-4">
                         <motion.div style={{ scale: trashScale, color: trashColor, opacity: trashOpacity }} className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-4 border-current flex items-center justify-center bg-white/50 backdrop-blur-sm shadow-sm">
                                <Trash2 className="w-10 h-10" />
                            </div>
                         </motion.div>
                         <motion.div style={{ scale: checkScale, color: checkColor, opacity: checkOpacity }} className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-4 border-current flex items-center justify-center bg-white/50 backdrop-blur-sm shadow-sm">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                         </motion.div>
                    </div>

                    <AnimatePresence>
                        {cards.slice(currentCardIndex, currentCardIndex + 2).reverse().map((cardText, i) => {
                            const isTopCard = i === 1 || cards.length - currentCardIndex === 1; 
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
                                    whileInView={{ scale: isTopCard ? 1 : 0.95, opacity: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                    className={`absolute inset-0 w-full h-full bg-white rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 ${!isTopCard ? 'bg-slate-50 border-slate-200' : 'border-slate-100'}`}
                                >
                                    <h3 className="text-2xl font-bold text-slate-800 leading-snug select-none">{cardText}</h3>
                                    {isTopCard && (
                                        <p className="absolute bottom-6 text-slate-300 text-xs font-bold uppercase tracking-widest">Swipe</p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>

        {/* FOOTER BUTTONS */}
        {!showDescriptionStep && (
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
                            setCurrentCardIndex(i => i - 1);
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
        )}

        {/* STREAMING DIALOG */}
        <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                 <Loader className="w-5 h-5 animate-spin text-indigo-600" />
                 <DialogTitle>Generating Curriculum</DialogTitle>
              </div>
              <DialogDescription>
                AI is analyzing your preferences to build a custom path.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-4 bg-slate-900 text-slate-300 font-mono text-xs">
              {streamLogs.length === 0 && (
                <div className="animate-pulse">Initializing AI engine...</div>
              )}
              {streamLogs.map((msg, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">{">"}</span>
                  <span>{msg}</span>
                </div>
              ))}
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                {streamStatus === "streaming" && "Processing..."}
                {streamStatus === "done" && "Complete! Redirecting..."}
                {streamStatus === "error" && "Error occurred."}
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default SwipeQuizPage;