import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Target, Zap, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext'; // ✅ GLOBAL LANGUAGE

const LandingPage = () => {
  const { lang, translate } = useLanguage(); // ✅ GLOBAL LANGUAGE ACCESS

  // ✅ ORIGINAL UI TEXT (ENGLISH ONLY)
  const originalText = {
    badge: "AI-Powered Learning Pathways",

    title1: "Your Personalized Path to",
    title2: "Success",

    description:
      "Get AI-powered learning recommendations tailored to your skills, goals, and aspirations. Start your journey to career success today.",

    getStarted: "Get Started Free",
    learnMore: "Learn More",

    howItWorks: "How It Works",
    howDesc: "Three simple steps to your personalized learning journey",

    step1Title: "1. Tell Us About You",
    step1Desc:
      "Share your background, skills, interests, and career goals through our simple onboarding process.",

    step2Title: "2. AI Analyzes Your Profile",
    step2Desc:
      "Our AI engine analyzes your profile against thousands of learning pathways and job opportunities.",

    step3Title: "3. Start Learning",
    step3Desc:
      "Get your personalized pathway with curated courses, certifications, and resources to achieve your goals.",

    ctaTitle: "Ready to Transform Your Career?",
    ctaDesc:
      "Join thousands of learners who have found their path to success",
    ctaBtn: "Start Your Journey Now",
  };

  const [uiText, setUiText] = useState(originalText);

  // ✅ AUTO TRANSLATE WHEN GLOBAL LANGUAGE CHANGES
  useEffect(() => {
    let mounted = true;

    async function translateUI() {
      if (lang === "en") {
        mounted && setUiText(originalText);
        return;
      }

      const translated: any = {};

      for (const key in originalText) {
        translated[key] = await translate(originalText[key as keyof typeof originalText]);
      }

      mounted && setUiText(translated);
    }

    translateUI();

    return () => {
      mounted = false;
    };
  }, [lang]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {uiText.badge}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              {uiText.title1}{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {uiText.title2}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {uiText.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth/register">
                <Button size="lg" className="text-lg px-8 gap-2">
                  {uiText.getStarted}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  {uiText.learnMore}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {uiText.howItWorks}
            </h2>
            <p className="text-lg text-muted-foreground">
              {uiText.howDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {uiText.step1Title}
              </h3>
              <p className="text-muted-foreground">
                {uiText.step1Desc}
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {uiText.step2Title}
              </h3>
              <p className="text-muted-foreground">
                {uiText.step2Desc}
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/50 rounded-2xl flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {uiText.step3Title}
              </h3>
              <p className="text-muted-foreground">
                {uiText.step3Desc}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-to-r from-primary to-secondary text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {uiText.ctaTitle}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {uiText.ctaDesc}
            </p>
            <Link to="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                {uiText.ctaBtn}
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
