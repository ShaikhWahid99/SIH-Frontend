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
  Lightbulb,
  Rocket
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type QuizCategory = "learning" | "motivation" | "preferences" | "goals";

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
  // ───────────────────── Motivation (5) ─────────────────────
  {
    id: 1,
    question: "What is your primary reason for learning right now?",
    type: "single",
    category: "motivation",
    icon: <Target className="w-6 h-6" />,
    options: [
      "To get a better job or promotion soon",
      "To switch into a new career/role",
      "To strengthen fundamentals and become confident",
      "To explore and figure out what I like",
    ],
  },
  {
    id: 2,
    question: "What keeps you going when the topic becomes difficult?",
    type: "single",
    category: "motivation",
    icon: <Zap className="w-6 h-6" />,
    options: [
      "Clear progress and small wins",
      "External deadlines or accountability",
      "Interest in the topic itself",
      "Rewards like certificates or recognition",
    ],
  },
  {
    id: 3,
    question: "How urgent do your learning outcomes feel?",
    type: "single",
    category: "motivation",
    icon: <Clock className="w-6 h-6" />,
    options: [
      "Very urgent – I need results in 1–3 months",
      "Moderately urgent – 3–6 months",
      "Long term – 6–12 months or more",
      "I'm exploring with no fixed timeline",
    ],
  },
  {
    id: 4,
    question: "What motivates you most after finishing a topic?",
    type: "single",
    category: "motivation",
    icon: <Star className="w-6 h-6" />,
    options: [
      "Being able to build or implement something",
      "Positive feedback from mentors/peers",
      "Seeing test scores or metrics improve",
      "Feeling that my basics are stronger",
    ],
  },
  {
    id: 5,
    question: "Which statement matches your mindset about learning?",
    type: "single",
    category: "motivation",
    icon: <Brain className="w-6 h-6" />,
    options: [
      "I'm okay with slow progress if I deeply understand",
      "I want fast visible results, even if not perfect",
      "I prefer a balance of speed and depth",
      "I'm still figuring out what works for me",
    ],
  },

  // ───────────────────── Learning Style (5) ─────────────────────
  {
    id: 6,
    question: "When you start a new topic, what do you prefer first?",
    type: "single",
    category: "learning",
    icon: <BookOpen className="w-6 h-6" />,
    options: [
      "A high-level overview video",
      "A structured course with clear modules",
      "Hands-on examples or mini projects",
      "Reading docs/blogs at my own pace",
    ],
  },
  {
    id: 7,
    question: "How do you understand a concept best?",
    type: "single",
    category: "learning",
    icon: <Zap className="w-6 h-6" />,
    options: [
      "By watching someone explain and demo it",
      "By doing it myself with guided steps",
      "By reading explanations and taking notes",
      "By discussing it with others",
    ],
  },
  {
    id: 8,
    question: "What kind of content format do you learn from most easily?",
    type: "single",
    category: "learning",
    icon: <BookOpen className="w-6 h-6" />,
    options: [
      "Short bite-sized videos (5–10 minutes)",
      "Longer, in-depth video lectures",
      "Written guides, blogs, or textbooks",
      "Interactive exercises and quizzes",
    ],
  },
  {
    id: 9,
    question: "During a learning session, how do you like to work?",
    type: "single",
    category: "learning",
    icon: <Users className="w-6 h-6" />,
    options: [
      "Fully focused solo, no distractions",
      "With a friend/accountability partner",
      "In a group/community setting",
      "Doesn't matter, I adapt to both",
    ],
  },
  {
    id: 10,
    question: "When you get stuck on a problem, what do you do first?",
    type: "single",
    category: "learning",
    icon: <Compass className="w-6 h-6" />,
    options: [
      "Search online (Google/Stack Overflow)",
      "Rewatch/revisit the theory or video",
      "Ask a mentor or community",
      "Leave it and come back later with a fresh mind",
    ],
  },

  // ───────────────────── Goals (5) ─────────────────────
  {
    id: 11,
    question: "What is your main learning goal for the next 6–12 months?",
    type: "single",
    category: "goals",
    icon: <Target className="w-6 h-6" />,
    options: [
      "Crack internships/jobs in tech",
      "Switch to a different tech stack or field",
      "Become very strong in core CS fundamentals",
      "Build a solid project portfolio",
    ],
  },
  {
    id: 12,
    question: "Which outcome would make you feel most successful?",
    type: "single",
    category: "goals",
    icon: <Star className="w-6 h-6" />,
    options: [
      "Getting shortlisted/selected in interviews",
      "Being able to build complex real-world apps",
      "Explaining concepts clearly to others",
      "Having a consistent learning habit",
    ],
  },
  {
    id: 13,
    question: "How deep do you want to go in your chosen topics?",
    type: "single",
    category: "goals",
    icon: <BookOpen className="w-6 h-6" />,
    options: [
      "Just enough to be job-ready quickly",
      "Deep understanding of fewer topics",
      "Breadth first, then depth later",
      "I'm not sure yet, I want guidance",
    ],
  },
  {
    id: 14,
    question:
      "Which type of goal structure do you find easiest to follow?",
    type: "single",
    category: "goals",
    icon: <Clock className="w-6 h-6" />,
    options: [
      "Daily small tasks with micro-goals",
      "Weekly targets with flexibility inside the week",
      "Larger monthly milestones",
      "Mix of all three depending on my schedule",
    ],
  },
  {
    id: 15,
    question: "How important are certifications or badges to you?",
    type: "single",
    category: "goals",
    icon: <Star className="w-6 h-6" />,
    options: [
      "Very important – they are a key priority",
      "Somewhat important – nice to have",
      "Not important – skills and projects matter more",
      "I'm not sure, I need guidance here",
    ],
  },

  // ───────────────────── Preferences (5) ─────────────────────
  {
    id: 16,
    question: "How much time can you realistically study on a typical weekday?",
    type: "single",
    category: "preferences",
    icon: <Clock className="w-6 h-6" />,
    options: [
      "15–30 minutes",
      "30–60 minutes",
      "1–2 hours",
      "It varies a lot day to day",
    ],
  },
  {
    id: 17,
    question: "What session style do you prefer for most days?",
    type: "single",
    category: "preferences",
    icon: <Users className="w-6 h-6" />,
    options: [
      "Short focused sprints (Pomodoro style)",
      "One long deep-work block",
      "Multiple small chunks across the day",
      "Depends on my energy that day",
    ],
  },
  {
    id: 18,
    question: "What type of feedback do you find most helpful?",
    type: "single",
    category: "preferences",
    icon: <Users className="w-6 h-6" />,
    options: [
      "Instant automated feedback (tests/quizzes)",
      "Detailed review from mentors",
      "Peer feedback and discussions",
      "Summary feedback at the end of a module",
    ],
  },
  {
    id: 19,
    question: "How structured do you want your learning path to be?",
    type: "single",
    category: "preferences",
    icon: <Target className="w-6 h-6" />,
    options: [
      "Highly structured with strict steps",
      "Guided path but a bit flexible",
      "Loose structure with suggestions only",
      "Completely flexible, I choose everything",
    ],
  },
  {
    id: 20,
    question: "How do you feel about collaborative learning?",
    type: "single",
    category: "preferences",
    icon: <Users className="w-6 h-6" />,
    options: [
      "I prefer learning solo most of the time",
      "I like occasional group activities",
      "I love community-based learning",
      "I'm open to trying group learning",
    ],
  },
];

const categoryColors: Record<QuizCategory, string> = {
  learning: "bg-blue-500 text-white",
  motivation: "bg-purple-500 text-white",
  preferences: "bg-green-500 text-white",
  goals: "bg-orange-500 text-white",
};

const categoryBgLight: Record<QuizCategory, string> = {
  learning: "bg-blue-50/95 border-blue-200 text-blue-900 ring-blue-100",
  motivation: "bg-purple-50/95 border-purple-200 text-purple-900 ring-purple-100",
  preferences: "bg-green-50/95 border-green-200 text-green-900 ring-green-100",
  goals: "bg-orange-50/95 border-orange-200 text-orange-900 ring-orange-100",
};

const categoryLabels: Record<QuizCategory, string> = {
  learning: "Learning Style",
  motivation: "Motivation",
  preferences: "Preferences",
  goals: "Goals",
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
  const [showResults, setShowResults] = useState(false);
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
      setShowResults(true);
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

      toast({
        title: "Profile Setup Complete! 🚀",
        description: "Your personalized dashboard is ready.",
      });

      navigate("/learner/dashboard", { replace: true });
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

  const getResultsSummary = useMemo(() => {
    const categories: QuizCategory[] = ["motivation", "goals", "learning", "preferences"];
    
    return categories.map(category => {
      // Find the first answer in this category to act as the "Primary" driver for the summary
      const firstQ = quizQuestions.find(q => q.category === category);
      const answer = firstQ ? answers[firstQ.id] : "Not answered";
      
      let icon = <Sparkles className="w-5 h-5" />;
      let title = "Insight";
      
      if (category === "motivation") {
        icon = <Rocket className="w-5 h-5" />;
        title = "Core Motivation";
      } else if (category === "goals") {
        icon = <Trophy className="w-5 h-5" />;
        title = "Primary Goal";
      } else if (category === "learning") {
        icon = <Brain className="w-5 h-5" />;
        title = "Learning Style";
      } else {
        icon = <Clock className="w-5 h-5" />;
        title = "Study Routine";
      }

      return {
        category,
        title,
        answer,
        icon
      };
    });
  }, [answers]);

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

  // ───────────────────── IKIGAI DIAGRAM RENDERING ─────────────────────
  if (showResults) {
    const motivation = getResultsSummary.find(r => r.category === 'motivation');
    const goals = getResultsSummary.find(r => r.category === 'goals');
    const learning = getResultsSummary.find(r => r.category === 'learning');
    const preferences = getResultsSummary.find(r => r.category === 'preferences');

    // Helper for rendering a circle in the diagram
    const IkigaiCircle = ({ 
      data, 
      className, 
      delay 
    }: { 
      data: typeof motivation, 
      className: string, 
      delay: number 
    }) => {
      if (!data) return null;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay }}
          className={`absolute rounded-full flex flex-col items-center justify-center p-6 text-center shadow-lg backdrop-blur-sm border-2 transition-all hover:scale-105 hover:z-50 z-10 w-64 h-64 md:w-72 md:h-72 ${categoryBgLight[data.category]} ${className}`}
        >
          <div className={`p-2 rounded-full mb-2 ${categoryColors[data.category]}`}>
            {data.icon}
          </div>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-2 opacity-80">{data.title}</h3>
          <p className="text-sm font-medium leading-snug line-clamp-4">
            {data.answer}
          </p>
        </motion.div>
      );
    };

    // Helper for rendering a mobile card
    const MobileCard = ({ data, delay }: { data: typeof motivation, delay: number }) => {
      if (!data) return null;
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay }}
          className={`relative rounded-3xl p-6 shadow-md border-2 -mt-4 first:mt-0 ${categoryBgLight[data.category]}`}
        >
           <div className="flex items-center gap-3 mb-3">
             <div className={`p-2 rounded-full ${categoryColors[data.category]} shadow-sm`}>
               {data.icon}
             </div>
             <h3 className="font-bold text-base">{data.title}</h3>
           </div>
           <p className="text-sm font-medium opacity-90 leading-relaxed">
             {data.answer}
           </p>
        </motion.div>
      );
    };

    return (
<div className="min-h-screen bg-[hsl(var(--card))] flex flex-col items-center py-8 px-4 relative overflow-x-hidden">


        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 z-10 relative"
        >
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'rgb(12 94 134)' }}>
            Your Learning Profile
          </h1>
          <p className="max-w-lg mx-auto" style={{ color: 'hsl(var(--primary) / 0.9)' }}>
            We've mapped your responses to find the perfect intersection of your goals, style, and motivation.
          </p>
        </motion.div>

        {/* ─── DESKTOP IKIGAI DIAGRAM ─── */}
  {/* ─── CENTER ENTIRE IKIGAI BLOCK ─── */}
<div className="flex flex-col items-center justify-center my-12">
  <div className="relative w-[360px] h-[630px] flex items-center justify-center">
    {/* TOP LEFT: Motivation */}
    <IkigaiCircle
      data={motivation}
      delay={0.1}
      className="absolute -top-14 -left-24"
    />

    {/* TOP RIGHT: Goals */}
    <IkigaiCircle
      data={goals}
      delay={0.2}
      className="absolute -top-14 -right-24"
    />

    {/* BOTTOM LEFT: Learning */}
    <IkigaiCircle
      data={learning}
      delay={0.3}
      className="absolute -bottom-50 -left-24"
    />

    {/* BOTTOM RIGHT: Preferences */}
    <IkigaiCircle
      data={preferences}
      delay={0.4}
      className="absolute -bottom-50 -right-24"
    />
  </div>
</div>


        {/* ─── MOBILE STACKED VIEW ─── */}
        <div className="md:hidden w-full max-w-sm flex flex-col pb-8 z-10 relative">
          <MobileCard data={motivation} delay={0.1} />
          <MobileCard data={goals} delay={0.2} />
          <MobileCard data={learning} delay={0.3} />
          <MobileCard data={preferences} delay={0.4} />
          
          <div className="mt-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xl border-2 border-indigo-100 mb-3">
               <span className="text-2xl">🎯</span>
            </div>
            <p className="font-bold text-gray-800">Your Personalized Path Ready</p>
          </div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          // className="z-50 -mt-4 md:mt-0 relative"
          className="relative z-50 mt-[-150px] flex justify-center"
        >
          <Button
            size="lg"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            // className="px-10 py-6 text-lg bg-gray-900 hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 rounded-full"

               className="px-10 py-6 text-lg bg-[hsl(var(--primary))] hover:brightness-300 text-white shadow-xl transition-all transform hover:-translate-y-1 rounded-full"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Generating...
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



















