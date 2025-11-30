import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Target, Zap, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning Pathways
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Your Personalized Path to{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Success
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get AI-powered learning recommendations tailored to your skills, goals, and aspirations. 
              Start your journey to career success today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth/register">
                <Button size="lg" className="text-lg px-8 gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Learn More
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
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to your personalized learning journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">1. Tell Us About You</h3>
              <p className="text-muted-foreground">
                Share your background, skills, interests, and career goals through our simple onboarding process.
              </p>
            </Card>
            
            <Card className="p-8 text-center space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">2. AI Analyzes Your Profile</h3>
              <p className="text-muted-foreground">
                Our AI engine analyzes your profile against thousands of learning pathways and job opportunities.
              </p>
            </Card>
            
            <Card className="p-8 text-center space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/50 rounded-2xl flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">3. Start Learning</h3>
              <p className="text-muted-foreground">
                Get your personalized pathway with curated courses, certifications, and resources to achieve your goals.
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
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of learners who have found their path to success
            </p>
            <Link to="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Your Journey Now
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
