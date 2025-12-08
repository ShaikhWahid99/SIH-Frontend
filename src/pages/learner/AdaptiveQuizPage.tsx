import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { api, DynamicQuizQuestion } from "@/lib/api";

type AnswerMap = Record<string, string>;

const AdaptiveQuizPage = () => {
  const [questions, setQuestions] = useState<DynamicQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const userId = (user as any)?._id || (user as any)?.id;
        if (!userId) throw new Error("User id is missing.");
        
        // This now fetches the data that was already saved in the DB during onboarding
        const qs = await api.getDynamicQuiz(userId);
        
        if (qs && qs.length > 0) {
          setQuestions(qs);
        } else {
          // Fallback if no questions were generated
          setQuestions([]);
        }
      } catch (err: any) {
        console.error("Error loading quiz:", err);
        toast({
          title: "Error loading quiz",
          description: "Could not load your personalized quiz.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [user, toast]);

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
      // Finished the last question
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

      // Save the answers to the backend
      await api.saveDynamicQuiz({
        dynamicQuizAnswers,
        dynamicQuizCompleted: true,
        dynamicQuizCompletedAt: new Date().toISOString(),
      });

      await refreshUser();
      
      toast({
        title: "Quiz Completed",
        description: "Your responses have been saved.",
      });

      navigate("/learner/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong saving your answers.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <Loader />
        <h2 className="text-2xl font-semibold text-slate-900 mt-6 mb-2">
          Loading your personalized quiz
        </h2>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-md text-center">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Quiz Not Available
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            We couldn't find a generated quiz for you. Please try refreshing or go back to onboarding.
          </p>
          <Button
            onClick={() => navigate("/onboarding", { replace: true })}
            className="w-full"
          >
            Go to Onboarding
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = !!answers[q.id];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-600 font-medium">Personalized Assessment</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Discovery Quiz</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            These questions have been tailored to your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question</span>
                   <div className="text-2xl font-bold text-slate-900">{currentIndex + 1}<span className="text-slate-300 text-lg">/{questions.length}</span></div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => {
                  const status = answers[questions[idx].id] ? 'done' : idx === currentIndex ? 'active' : 'pending';
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                        status === 'active' ? 'bg-blue-600 text-white shadow-md scale-110' :
                        status === 'done' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}
                    >
                      {status === 'done' ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Question Card */}
          <main className="lg:col-span-8">
            <Card ref={cardRef} className="p-8 border-slate-200 shadow-lg rounded-2xl">
               <h2 className="text-2xl font-semibold text-slate-900 mb-8 leading-snug">
                 {q.question}
               </h2>

               <div className="grid grid-cols-1 gap-3">
                 {q.options.map((opt, idx) => {
                    const isSelected = answers[q.id] === opt;
                    const labels = ["A", "B", "C", "D", "E", "F"];
                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(opt)}
                            className={`group relative flex items-center p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                isSelected 
                                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                                : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-4 transition-colors ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                            }`}>
                                {labels[idx] || (idx + 1)}
                            </div>
                            <span className={`flex-1 font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                {opt}
                            </span>
                            {isSelected && <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />}
                        </button>
                    )
                 })}
               </div>

               <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                 <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0} className="text-slate-500 hover:text-slate-900">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                 </Button>
                 <Button 
                    onClick={handleNext} 
                    disabled={!isAnswered || submitting} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                 >
                    {currentIndex === questions.length - 1 ? (
                      submitting ? "Saving..." : "Finish Quiz"
                    ) : (
                      <>Next Question <ChevronRight className="w-4 h-4 ml-2" /></>
                    )}
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