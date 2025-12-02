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
  Rocket,
  Heart,
  Briefcase,
  Globe,
  User,
  MapPin,
  Smile,
  
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type QuizCategory = "interest" | "skills" | "purpose" | "career" | "personality";

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
  // ──────────────── 🎯 A. What You Love (Interest & Passion) ────────────────
  {
    id: 1,
    question: "Which type of activities do you enjoy the most?",
    type: "single",
    category: "interest",
    icon: <Heart className="w-5 h-5" />,
    options: ["Working with machines or tools", "Helping or interacting with people", "Solving problems or analyzing data", "Creating or designing things", "Working outdoors / physical tasks"],
  },
  {
    id: 2,
    question: "What kind of topics excite you the most?",
    type: "single",
    category: "interest",
    icon: <Heart className="w-5 h-5" />,
    options: ["Technology & computers", "Healthcare & helping others", "Business & management", "Arts, design, or creativity", "Agriculture, nature, field work"],
  },
  {
    id: 3,
    question: "If you had a full free day, what would you spend it doing?",
    type: "single",
    category: "interest",
    icon: <Heart className="w-5 h-5" />,
    options: ["Building or fixing something", "Reading/learning new concepts", "Creating art/design/content", "Meeting people / social activities", "Exploring outdoors or hands-on tasks"],
  },
  {
    id: 4,
    question: "Which school/college subject did you enjoy the most?",
    type: "single",
    category: "interest",
    icon: <Heart className="w-5 h-5" />,
    options: ["Maths / Science", "English / Communication", "Art / Design / Creativity", "Computer Science", "Physical Education / Field activities"],
  },
  {
    id: 5,
    question: "What type of work do you prefer?",
    type: "single",
    category: "interest",
    icon: <Heart className="w-5 h-5" />,
    options: ["Working with machines or technology", "Working with people", "Working with ideas and data", "Working outdoors", "Working creatively"],
  },

  // ──────────────── 🧠 B. What You're Good At (Skills & Strengths) ────────────────
  {
    id: 6,
    question: "How good are you at solving problems?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: ["Excellent", "Good", "Average", "Poor"],
  },
  {
    id: 7,
    question: "Are you comfortable using machines, tools, or equipment?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: ["Very comfortable", "Somewhat comfortable", "A little uncomfortable", "Not comfortable"],
  },
  {
    id: 8,
    question: "How well do you adapt to sudden changes?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: ["Very easily", "Somewhat easily", "With difficulty", "Not at all"],
  },
  {
    id: 9,
    question: "Which of the following are your strongest skills?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: ["Technical skills", "Communication & people skills", "Creativity", "Logical/analytical thinking", "Physical/manual work"],
  },
  {
    id: 10,
    question: "How well do you follow detailed instructions or SOPs?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: ["Very well", "Well", "Average", "Poorly"],
  },
  {
    id: 11,
    question: "What type of task are you better at?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: ["Mental/logical tasks", "Hands-on physical tasks", "Creative tasks", "People-oriented tasks"],
  },
  {
    id: 12,
    question: "What work style suits you best?",
    type: "single",
    category: "skills",
    icon: <Zap className="w-5 h-5" />,
    options: ["Structured with clear rules", "Flexible & open-ended", "Creative and innovative", "Field-based and active"],
  },

  // ──────────────── 🌍 C. What the World Needs (Purpose & Social Fit) ────────────────
  {
    id: 13,
    question: "Do you enjoy helping people directly?",
    type: "single",
    category: "purpose",
    icon: <Globe className="w-5 h-5" />,
    options: ["Yes, very much", "Somewhat", "Not really", "No"],
  },
  {
    id: 14,
    question: "Do you enjoy improving processes, systems, or products?",
    type: "single",
    category: "purpose",
    icon: <Globe className="w-5 h-5" />,
    options: ["Yes, I like identifying problems", "Yes, but only simple improvements", "Sometimes", "Not at all"],
  },
  {
    id: 15,
    question: "What motivates you the most?",
    type: "single",
    category: "purpose",
    icon: <Globe className="w-5 h-5" />,
    options: ["Helping people", "Creating or improving things", "Earning a stable income", "Solving challenging problems", "Doing physical tasks/productive work"],
  },
  {
    id: 16,
    question: "Would you choose a career where you contribute to society?",
    type: "single",
    category: "purpose",
    icon: <Globe className="w-5 h-5" />,
    options: ["Definitely", "Maybe", "Not sure", "Not really"],
  },

  // ──────────────── 💼 D. What You Can Be Paid For (Career Fit) ────────────────
  {
    id: 17,
    question: "What work environment do you prefer?",
    type: "single",
    category: "career",
    icon: <Briefcase className="w-5 h-5" />,
    options: ["Office", "Field/outdoor", "Workshop/lab", "Remote/digital", "Any environment"],
  },
  {
    id: 18,
    question: "How comfortable are you taking responsibility?",
    type: "single",
    category: "career",
    icon: <Briefcase className="w-5 h-5" />,
    options: ["Very comfortable", "Somewhat comfortable", "Slightly uncomfortable", "Not comfortable"],
  },
  {
    id: 19,
    question: "What type of tasks do you like?",
    type: "single",
    category: "career",
    icon: <Briefcase className="w-5 h-5" />,
    options: ["Routine and predictable", "Dynamic and changing", "Creative and flexible", "Physical and hands-on"],
  },
  {
    id: 20,
    question: "Are you willing to learn new technical or vocational skills?",
    type: "single",
    category: "career",
    icon: <Briefcase className="w-5 h-5" />,
    options: ["Yes, definitely", "Yes, somewhat", "Maybe", "No"],
  },
  {
    id: 21,
    question: "Do you prefer working under supervision or independently?",
    type: "single",
    category: "career",
    icon: <Briefcase className="w-5 h-5" />,
    options: ["Independently", "With minimal supervision", "Under guidance", "Fully supervised"],
  },

  // ──────────────── ⚡ E. Personality, Decision-Making & Work Style ────────────────
  {
    id: 22,
    question: "How do you handle pressure?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Very well", "Well", "Not very well", "Poorly"],
  },
  {
    id: 23,
    question: "What teamwork style suits you best?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Leading a team", "Working with a team", "Supporting teammates", "Working alone"],
  },
  {
    id: 24,
    question: "How often do you want to learn new skills?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Very often", "Sometimes", "Rarely", "Never"],
  },
  {
    id: 25,
    question: "How important is job stability to you?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Very important", "Important", "Somewhat important", "Not important"],
  },
  {
    id: 26,
    question: "Are you comfortable with physical work?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Yes, very comfortable", "Somewhat comfortable", "A bit uncomfortable", "Not comfortable"],
  },
  {
    id: 27,
    question: "What type of thinker are you?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Detail-oriented", "Big-picture focused", "Creative thinker", "Logical thinker"],
  },
  {
    id: 28,
    question: "What type of problems do you prefer solving?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Technical issues", "People issues", "Creative challenges", "Physical challenges"],
  },
  {
    id: 29,
    question: "Are you willing to travel for work?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Yes, frequently", "Occasionally", "Rarely", "Never"],
  },
  {
    id: 30,
    question: "Do you enjoy teaching or guiding others?",
    type: "single",
    category: "personality",
    icon: <Smile className="w-5 h-5" />,
    options: ["Yes, very much", "Somewhat", "Rarely", "Never"],
  },
];

const categoryColors: Record<QuizCategory, string> = {
  interest: "bg-rose-500 text-white",
  skills: "bg-amber-500 text-white",
  purpose: "bg-emerald-500 text-white",
  career: "bg-[hsl(var(--primary)/0.9)] text-white",
  personality: "bg-purple-500 text-white",
};

const categoryBgLight: Record<QuizCategory, string> = {
  interest: "bg-rose-50/95 border-rose-200 text-rose-900 ring-rose-100",
  skills: "bg-amber-50/95 border-amber-200 text-amber-900 ring-amber-100",
  purpose: "bg-emerald-50/95 border-emerald-200 text-emerald-900 ring-emerald-100",
  career: "bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] ring-[hsl(var(--primary)/0.2)]",
  personality: "bg-purple-50/95 border-purple-200 text-purple-900 ring-purple-100",
};

const categoryLabels: Record<QuizCategory, string> = {
  interest: "Interests & Passion",
  skills: "Skills & Strengths",
  purpose: "Purpose & Impact",
  career: "Career Fit",
  personality: "Personality & Style",
};

const categoryIcons: Record<QuizCategory, ReactNode> = {
  interest: <Heart className="w-5 h-5" />,
  skills: <Zap className="w-5 h-5" />,
  purpose: <Globe className="w-5 h-5" />,
  career: <Briefcase className="w-5 h-5" />,
  personality: <Smile className="w-5 h-5" />,
}

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

// --- Sub-components ---

const HexItem = ({ 
  data, 
  index,
  total
}: { 
  data: any, 
  index: number,
  total: number
}) => {
  // Calculate position around a circle
  // Starting from top ( -90 degrees offset)
  const angle = (index * (360 / total)) - 90;
  const radius = 180; // Distance from center in px
  const radian = (angle * Math.PI) / 180;
  
  // We use CSS transform for positioning to keep it responsive-ish
  // But for the desktop view we want explicit coordinates relative to center
  const x = Math.cos(radian) * radius;
  const y = Math.sin(radian) * radius;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{ opacity: 1, scale: 1, x: x, y: y }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`absolute w-44 p-4 rounded-xl shadow-lg border backdrop-blur-sm z-10 flex flex-col items-center text-center
        ${categoryBgLight[data.category as QuizCategory]}`}
      style={{ 
        // This centers the item on its calculated point
        marginLeft: -88, // Half width
        marginTop: -60,  // Half height (approx)
      }}
    >
      <div className={`p-2 rounded-full mb-2 ${categoryColors[data.category as QuizCategory]}`}>
        {data.icon}
      </div>
      <h3 className="font-bold text-xs uppercase tracking-wider mb-1 opacity-80">{data.title}</h3>
      <p className="text-xs font-semibold leading-tight line-clamp-2">
        {data.answer}
      </p>
    </motion.div>
  );
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

      navigate("/adaptive-quiz", { replace: true });

      // toast({
      //   title: "Profile Setup Complete! 🚀",
      //   description: "Your personalized dashboard is ready.",
      // });

      // navigate("/learner/dashboard", { replace: true });
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
    const categories: QuizCategory[] = ["skills", "career", "interest", "purpose", "personality"];
    
    return categories.map(category => {
      // Find the first answer in this category to act as the "Primary" driver for the summary
      const firstQ = quizQuestions.find(q => q.category === category);
      const answer = firstQ ? answers[firstQ.id] : "Not answered";
      
      let icon = <Sparkles className="w-5 h-5" />;
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

  // ───────────────────── 5-WAY RADAR/HEX RESULT RENDERING ─────────────────────
  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 z-10 relative max-w-2xl"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'hsl(var(--primary))', filter: 'brightness(0.6)' }}>
            Your Comprehensive Profile
          </h1>
          <p className="text-slate-600">
            We've analyzed your responses across 5 key dimensions to generate your unique learning DNA.
          </p>
        </motion.div>

        {/* ─── DESKTOP PENTAGON/CIRCLE VIEW ─── */}
        <div className="hidden md:flex relative w-[600px] h-[600px] items-center justify-center my-8">
            {/* Connecting Lines (Decorative) */}
            <svg className="absolute inset-0 w-full h-full text-slate-200" style={{ zIndex: 0 }}>
               <circle cx="300" cy="300" r="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
               <circle cx="300" cy="300" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>

            {/* Center Node */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute z-20 w-32 h-32 bg-white rounded-full shadow-xl border-4 border-slate-100 flex items-center justify-center flex-col"
            >
               <span className="text-3xl">🎯</span>
               <span className="text-xs font-bold text-slate-400 mt-1">YOU</span>
            </motion.div>

            {/* Satellite Nodes */}
            {getResultsSummary.map((item, index) => (
              <HexItem key={item.category} data={item} index={index} total={5} />
            ))}
        </div>

        {/* ─── MOBILE STACKED VIEW ─── */}
        <div className="md:hidden w-full max-w-sm flex flex-col gap-4 pb-12">
           {getResultsSummary.map((item, index) => (
             <motion.div
               key={item.category}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
               className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${categoryBgLight[item.category as QuizCategory]}`}
             >
                <div className={`p-2.5 rounded-full ${categoryColors[item.category as QuizCategory]}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase opacity-70 mb-0.5">{item.title}</h3>
                  <p className="text-sm font-semibold">{item.answer}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative z-50 md:-mt-12"
        >
          <Button
            size="lg"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all bg-[hsl(var(--primary)/0.9)] hover:bg-[hsl(var(--primary))] text-white"
          >
            {isSubmitting ? (
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



















