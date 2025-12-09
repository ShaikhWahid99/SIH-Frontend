import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Target,
  Sparkles,
  Zap,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

const Hero = () => {
  return (
    <div>
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl opacity-50 animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left space-y-8 animate-fade-in-up">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Your personalized path to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                  Success
                </span>
              </h1>

              <p className="text-xl text-foreground/70 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                Stop guessing what to learn next. Our AI analyzes your skills and
                market trends to generate a custom roadmap just for you.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
                <Link
                  to="/auth/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary/90 text-white font-semibold text-lg hover:bg-primary hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                >
                  Start Learning Free
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            {/* Visual Mockup */}
            <div className="flex-1 relative w-full max-w-lg md:max-w-none animate-float">
              <div className="relative aspect-square md:aspect-[4/3] rounded-2xl bg-gradient-to-br from-foreground to-gray-800 shadow-2xl border border-gray-700 p-2 sm:p-4 overflow-hidden">
                <div className="w-full h-full bg-gray-900 rounded-xl overflow-hidden relative">
                  {/* Mockup Header */}
                  <div className="h-12 border-b border-gray-800 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-800 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Progress</span>
                        <span>78%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary w-[78%]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-24 rounded-lg bg-gray-800/50 border border-gray-700/50 p-3 space-y-2"
                        >
                          <div className="w-8 h-8 rounded bg-gray-700/50" />
                          <div className="h-2 w-2/3 bg-gray-700/50 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute top-1/2 -right-8 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        A+
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Skill Score</div>
                        <div className="text-sm font-bold text-gray-900">
                          Excellent
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Target size={20} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Next Goal</div>
                        <div className="text-sm font-bold text-gray-900">
                          Senior Dev
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur-2xl opacity-20 -z-10" />
            </div>
          </div>
        </div>
      </section>

    <section className="py-24 bg-white">
  <div className="container mx-auto px-6 max-w-5xl">

    {/* Heading */}
    <div className="text-center mb-16 animate-fade-in-up">
      <h2 className="text-base font-semibold text-primary tracking-wide uppercase mb-3">
        Our Mission
      </h2>
      <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
        Unlocking Career Growth with Adaptive, NSQF-Aligned Skilling
      </h3>
      <p className="text-lg text-foreground/70 leading-relaxed max-w-3xl mx-auto">
        Bridging the gap between aspirations and opportunities through dynamic, NSQF-mapped guidance.
        A future-ready platform designed to make vocational training accessible, adaptive, and relevant for all.
      </p>
    </div>

    {/* ✨ 3 CARD GRID */}
    <div className="grid md:grid-cols-3 gap-8">

      {/* CARD 1 – AI Powered */}
      <div
        className="p-6 rounded-2xl 
        bg-[hsl(var(--primary)/0.08)] 
        border border-[hsl(var(--primary)/0.15)]
        text-center shadow-sm hover:shadow-xl hover:-translate-y-2 
        transition-all duration-500 animate-fade-in-up"
      >
        <BrainCircuit
          className="w-10 h-10 mx-auto mb-4 text-primary 
          transition-transform duration-300"
        />
        <h4 className="font-bold text-xl mb-2">AI-Powered</h4>
        <p className="text-foreground/70">
          Smart models analyze your profile to recommend the best learning path.
        </p>
      </div>

      {/* CARD 2 – Community Driven */}
      <div
        className="p-6 rounded-2xl 
        bg-[hsl(var(--primary)/0.08)] 
        border border-[hsl(var(--primary)/0.15)]
        text-center shadow-sm hover:shadow-xl hover:-translate-y-2 
        transition-all duration-500 animate-fade-in-up delay-150"
      >
        <Sparkles
          className="w-10 h-10 mx-auto mb-4 text-secondary 
          transition-transform duration-300"
        />
        <h4 className="font-bold text-xl mb-2">NSQF Aligned</h4>
        <p className="text-foreground/70">
          Every learning path follows the National Skills Qualifications 
            Framework for recognized certification.
        </p>
      </div>

      {/* CARD 3 – Career Growth */}
      <div
        className="p-6 rounded-2xl 
        bg-[hsl(var(--primary)/0.08)] 
        border border-[hsl(var(--primary)/0.15)]
        text-center shadow-sm hover:shadow-xl hover:-translate-y-2 
        transition-all duration-500 animate-fade-in-up delay-300"
      >
        <TrendingUp
          className="w-10 h-10 mx-auto mb-4 text-indigo-600 
          transition-transform duration-300"
        />
        <h4 className="font-bold text-xl mb-2">Adaptive and dynamic guidance</h4>
        <p className="text-foreground/70">
          Each learning path adapts in real-time to your skills and goals, providing dynamic guidance to ensure continuous progress and career relevance.
        </p>
      </div>

    </div>

  </div>
</section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section className="py-24 bg-[hsl(var(--primary)/0.06)] relative overflow-hidden">
  {/* Soft dividers */}
  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.20)] to-transparent" />
  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.20)] to-transparent" />

  <div className="container mx-auto px-6">
    <div className="text-center max-w-3xl mx-auto mb-20">
      <h2 className="text-base font-semibold text-primary tracking-wide uppercase mb-3">
        Simple Process
      </h2>
      <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
        Your journey to expertise, <br /> simplified.
      </h3>
      <p className="text-lg text-muted-foreground">
        We've stripped away the complexity of curriculum planning so you
        can focus on what matters: actually learning.
      </p>
    </div>

    <div className="relative grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 
          bg-gradient-to-r from-gray-200 via-primary/30 to-gray-200 -z-10" />

      {/* CARD 1 */}
      <div className="group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            <Target className="w-8 h-8" />
          </div>
        </div>
        <h4 className="text-xl font-bold text-center mb-3">1. Profile Analysis</h4>
        <p className="text-muted-foreground text-center leading-relaxed">
          Connect your GitHub or LinkedIn. We analyze your current stack
          and identify critical knowledge gaps.
        </p>
      </div>

      {/* CARD 2 */}
      <div className="group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="w-24 h-24 bg-secondary/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/10 transition-colors relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-secondary/30 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-8 h-8" />
          </div>
        </div>
        <h4 className="text-xl font-bold text-center mb-3">2. AI Generation</h4>
        <p className="text-muted-foreground text-center leading-relaxed">
          Our Gemini-powered engine builds a custom node-based learning
          tree tailored to your career goals.
        </p>
      </div>

      {/* CARD 3 */}
      <div className="group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/10 transition-colors relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
        <h4 className="text-xl font-bold text-center mb-3">3. Rapid Growth</h4>
        <p className="text-muted-foreground text-center leading-relaxed">
          Follow the path, complete automated challenges, and track your
          velocity towards Senior level.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* ================= CTA SECTION ================= */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[2.5rem] bg-gradient-to-r from-primary to-secondary overflow-hidden shadow-2xl shadow-primary/30">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-soft-light"></div>

            <div className="relative z-10 p-12 md:p-20 text-center text-white space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Ready to accelerate your career?
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Join thousands of developers, designers, and product managers who
                have found their personalized path to success.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/auth/register" className="w-full sm:w-auto">
                  <button className="w-full px-8 py-4 bg-white text-primary rounded-full font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2">
                    Start Your Journey Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>

              <p className="text-sm text-white/60 pt-4">
                Free for individuals. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};  

export default Hero;