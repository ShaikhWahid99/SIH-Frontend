import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ThumbsUp, ThumbsDown, ChevronRight, CheckCircle } from "lucide-react";
import { api, SwipeRequest, SwipeStage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";

type Rating = "like" | "dislike" | null;

const STAGES: SwipeStage[] = ["START", "BATCH_1", "BATCH_2", "BATCH_3", "BATCH_4"];

const SwipeQuizPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();

  const [currentStage, setCurrentStage] = useState<SwipeStage>("START");
  const [cards, setCards] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [batchesCompleted, setBatchesCompleted] = useState<number>(0);
  const [nextStageHint, setNextStageHint] = useState<SwipeStage | undefined>(undefined);
  const [isDoneHint, setIsDoneHint] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [savedLikes, setSavedLikes] = useState<string[]>([]);
  const [showDescriptionStep, setShowDescriptionStep] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");

  const allRated = useMemo(() => cards.length > 0 && ratings.every((r) => r !== null), [cards, ratings]);

  useEffect(() => {
    loadBatch("START", [] , []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBatch = async (stage: SwipeStage, likedCards: string[], dislikedCards: string[]) => {
    let uid = user?.userDetails?._id as string | undefined;
    if (!uid) {
      const refreshed = await refreshUser();
      uid = refreshed?.userDetails?._id as string | undefined;
    }
    if (!uid) {
      toast({ title: "Not signed in", description: "Please log in again.", variant: "destructive" });
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
    } catch (err: unknown) {
      console.error("Swipe logic error", err);
      const message = err instanceof Error ? err.message : "Could not load quiz.";
      toast({ title: "Quiz loading failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (index: number, value: Exclude<Rating, null>) => {
    setRatings((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    const text = cards[index];
    if (value === "like" && text && !savedLikes.includes(text)) {
      setSavedLikes((s) => [...s, text]);
      api
        .saveDynamicQuiz({ dynamicQuizAnswers: [{ question: text, answer: "like" }] })
        .catch(() => {});
    }
    if (index < cards.length - 1) {
      setCurrentCardIndex(index + 1);
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
      if (totalLikes <= 3 && !showDescriptionStep && !description) {
        setShowDescriptionStep(true);
        return;
      }
      try {
        setSubmitting(true);
        const dynamicQuizAnswers = [
          ...nextLiked.map((text) => ({ question: text, answer: "like" })),
          ...(description
            ? [{ question: "Self Description", answer: description.trim(), category: "description" }]
            : []),
        ];
        await api.saveDynamicQuiz({ dynamicQuizAnswers, careerGoal: description || undefined });
        await refreshUser();
        toast({ title: "Quiz completed", description: "Personalization updated successfully." });
        navigate("/learner/dashboard", { replace: true });
      } catch (err: unknown) {
        console.error("Save dynamic quiz error", err);
        const message = err instanceof Error ? err.message : "Could not save quiz.";
        toast({ title: "Save failed", description: message, variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setLiked(nextLiked);
    setDisliked(nextDisliked);
    setBatchesCompleted((n) => n + 1);
    await loadBatch(nextStage, nextLiked, nextDisliked);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-5 h-5 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Preparing your quiz</h3>
          <p className="text-sm text-slate-600">Fetching your first batch of cards…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {showDescriptionStep ? (
          <Card className="p-6 bg-white border-slate-200 shadow-sm">
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm mb-4">
                <Sparkles className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-600 font-medium">Final Step</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Describe yourself</h2>
              <p className="text-slate-600">Add a short description to refine personalization.</p>
            </div>
            <Textarea
              placeholder="Write a short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex items-center justify-end mt-4">
              <Button
                onClick={async () => {
                  if (!description.trim()) return;
                  try {
                    setSubmitting(true);
                    const dynamicQuizAnswers = [
                      ...savedLikes.map((text) => ({ question: text, answer: "like" })),
                      { question: "Self Description", answer: description.trim(), category: "description" },
                    ];
                    await api.saveDynamicQuiz({ dynamicQuizAnswers, careerGoal: description.trim() });
                    await refreshUser();
                    toast({ title: "Saved", description: "Profile updated successfully." });
                    navigate("/learner/dashboard", { replace: true });
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "Could not save.";
                    toast({ title: "Save failed", description: message, variant: "destructive" });
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting || !description.trim()}
              >
                Finish
              </Button>
            </div>
          </Card>
        ) : (
        <>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-600 font-medium">Swipe-based Preferences</span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Quick Swipe Quiz</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Like or dislike the statements below to help us tailor your learning path.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Stage: <span className="font-medium text-slate-900">{currentStage}</span></div>
            <div className="text-sm text-slate-600">Batch {batchesCompleted + 1} of 4</div>
          </div>
        </div>

        <div className="mb-8">
          {cards.length > 0 && (
            <Card className="p-6 shadow-sm border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-600">Card {currentCardIndex + 1} of {cards.length}</div>
                <div className="text-sm text-slate-600">Rated: {ratings.filter((r) => r !== null).length}/{cards.length}</div>
              </div>
              <div className="h-36 flex items-center justify-center text-center">
                <p className="text-slate-800 text-sm">{cards[currentCardIndex]}</p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant={ratings[currentCardIndex] === "like" ? "default" : "outline"}
                  className={ratings[currentCardIndex] === "like" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                  onClick={() => handleRate(currentCardIndex, "like")}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" /> Like
                </Button>
                <Button
                  variant={ratings[currentCardIndex] === "dislike" ? "default" : "outline"}
                  className={ratings[currentCardIndex] === "dislike" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}
                  onClick={() => handleRate(currentCardIndex, "dislike")}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" /> Dislike
                </Button>
              </div>
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentCardIndex((i) => Math.max(0, i - 1))}
                  disabled={currentCardIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    if (currentCardIndex < cards.length - 1) {
                      setCurrentCardIndex((i) => i + 1);
                    } else {
                      if (allRated) goNext();
                    }
                  }}
                  disabled={ratings[currentCardIndex] === null}
                >
                  {currentCardIndex < cards.length - 1 ? "Next" : "Complete Batch"}
                </Button>
              </div>
            </Card>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default SwipeQuizPage;
