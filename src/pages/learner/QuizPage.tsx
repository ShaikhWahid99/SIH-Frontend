import React, { ReactNode, useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  BookOpen,
  Zap,
  ArrowRight,
  CheckCircle2,
  Brain,
  Trophy,
  Rocket,
  Heart,
  Briefcase,
  Globe,
  User,
  MapPin,
  Smile,
  Lightbulb,
  Target
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- Mocks for external dependencies to ensure the app runs standalone ---

const useToast = () => {
  return {
    toast: ({ title, description }: { title: string; description: string }) => {
      console.log(`TOAST: ${title} - ${description}`);
      alert(`${title}\n${description}`);
    },
  };
};

const useAuth = () => ({
  refreshUser: async () => console.log("User refreshed"),
});

const api = {
  postMe: async (data: any) => {
    console.log("API POST:", data);
    return { success: true };
  },
};

// --- UI Components ---

const Card = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  disabled,
  className,
  variant = "primary",
  size = "md",
}: {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-[hsl(var(--primary)/0.9)] text-white hover:bg-[hsl(var(--primary))]",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
  };
  const sizes = {
    sm: "h-9 rounded-md px-3",
    md: "h-10 px-4 py-2",
    lg: "h-11 rounded-md px-8 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
    >
      {children}
    </button>
  );
};

// --- Types & Data ---

type QuizCategory =
  | "interest"
  | "skills"
  | "purpose"
  | "career"
  | "personality";

interface QuizQuestion {
  id: number;
  question: string;
  type: "single";
  options: string[];
  icon?: ReactNode;
  category: QuizCategory;
}

// Corrected Quiz Data with 5 Categories (30 questions total)
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

// --- Main Quiz Component ---

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const currentQuestionData = quizQuestions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / quizQuestions.length) * 100;
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
      // Simulation of API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await api.postMe({ quizAnswers: answers });
      await refreshUser();
      
      toast({
        title: "Profile Setup Complete! 🚀",
        description: "Your personalized dashboard is ready.",
      });
      // In a real app: navigate("/dashboard");
    } catch (error) {
      console.error("Quiz submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultsSummary = useMemo(() => {
    const categories: QuizCategory[] = ["interest", "skills", "purpose", "career", "personality"];
    
    return categories.map(category => {
      // Just for visualization: grab the first answer from the category
      // In a real app, this would use a complex scoring algorithm
      const firstQ = quizQuestions.find(q => q.category === category);
      const answer = firstQ ? answers[firstQ.id] : "Not answered";
      
      return {
        category,
        title: categoryLabels[category],
        answer,
        icon: categoryIcons[category]
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
                    ? "bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.9)] text-[hsl(var(--primary))] shadow-sm scale-[1.01]"
                    : "border-slate-200 bg-white hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm hover:scale-[1.01] text-slate-700"
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
                        ? "border-[hsl(var(--primary)/0.9)] bg-[hsl(var(--primary)/0.9)]"
                        : "border-slate-300 group-hover:border-[hsl(var(--primary)/0.4)]"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[hsl(var(--primary)/0.05)] py-6 px-4 font-sans text-slate-900">
      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8 shadow-2xl border-0 bg-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-[hsl(var(--primary)/0.1)] rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-[hsl(var(--primary)/0.9)] -rotate-3" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Discover Your Learning DNA
              </h2>

              <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                We analyze 5 key dimensions of your profile to create a hyper-personalized curriculum that matches your strengths, interests, and lifestyle.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                 {Object.entries(categoryLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                       <span className={`w-2 h-2 rounded-full ${categoryColors[key as QuizCategory].split(' ')[0]}`}></span>
                       {label}
                    </div>
                 ))}
              </div>

              <Button
                onClick={() => setShowWelcomePopup(false)}
                className="w-full gap-2 py-6 text-lg bg-[hsl(var(--primary)/0.9)] hover:bg-[hsl(var(--primary))]"
                size="lg"
              >
                Start Assessment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div
        className={`max-w-6xl mx-auto transition-all duration-500 ${
          showWelcomePopup ? "blur-md pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        {/* Header Progress */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                <Brain className="w-6 h-6 text-[hsl(var(--primary)/0.9)]" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                  Profile Assessment
                </h1>
                <p className="text-xs md:text-sm text-slate-500">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-[hsl(var(--primary)/0.9)] bg-[hsl(var(--primary)/0.1)] px-3 py-1 rounded-full">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-[hsl(var(--primary)/0.9)] via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start">
          {/* Left Sidebar: Navigation & Context */}
          <Card className="p-5 bg-white/80 border-slate-200 shadow-sm sticky top-6 hidden lg:block">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">
              Assessment Map
            </h3>

            <div className="mb-6">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${categoryBgLight[currentQuestionData.category]}`}
              >
                <div className={`p-2 rounded-md ${categoryColors[currentQuestionData.category]}`}>
                   {currentQuestionData.icon}
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Current Section</p>
                   <p className="font-bold text-sm">{categoryLabels[currentQuestionData.category]}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Progress
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {quizQuestions.map((q, index) => {
                  const answered = Boolean(answers[q.id]);
                  const isActive = index === currentQuestion;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleQuestionJump(index)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-300
                        ${
                          isActive
                            ? "bg-slate-900 text-white shadow-md scale-110 ring-2 ring-slate-200 ring-offset-1"
                            : answered
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Main Question Card */}
          <Card className="p-6 md:p-10 bg-white border-slate-200 shadow-lg min-h-[500px] flex flex-col justify-between relative overflow-hidden">
             {/* Decorative Background Icon */}
             <div className="absolute -top-10 -right-10 text-slate-50 opacity-50 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                   {/* We render the icon as a giant watermark */}
                   {currentQuestionData.icon} 
                </svg>
             </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestionData.id}
                variants={questionVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8 z-10"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                      <div
                        className={`md:hidden p-2 rounded-lg ${categoryColors[currentQuestionData.category]}`}
                      >
                        {currentQuestionData.icon}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${categoryBgLight[currentQuestionData.category]}`}>
                         {categoryLabels[currentQuestionData.category]}
                      </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                    {currentQuestionData.question}
                  </h2>
                  
                  <p className="text-slate-500">
                    Select the option that best describes you.
                  </p>
                </div>

                <div className="py-2">
                  {renderOptions(currentQuestionData)}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="gap-2 pl-3 pr-4"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="hidden md:block text-xs font-medium text-slate-400">
                 {isCurrentQuestionAnswered ? "Answer Recorded" : "Pending Answer..."}
              </div>

              <Button
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered || isSubmitting}
                className="gap-2 pl-6 pr-4 shadow-lg shadow-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.9)] hover:bg-[hsl(var(--primary))]"
              >
                {currentQuestion === quizQuestions.length - 1
                  ? "Finish Assessment"
                  : "Next Question"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;