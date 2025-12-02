// src/pages/AdaptiveQuizPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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
      handleSubmit();
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

  if (!questions.length) {
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
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = !!answers[q.id];

  // Question categories for visual enhancement
  const categories = [
    "Interests & Passion",
    "Skills & Strengths", 
    "Work Preferences",
    "Career Goals",
    "Learning Style"
  ];
  const currentCategory = categories[currentIndex % categories.length];

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