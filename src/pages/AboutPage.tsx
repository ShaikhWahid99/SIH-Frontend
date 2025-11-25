import { Card } from '@/components/ui/card';
import { Brain, Users, Award, TrendingUp } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About LearnPath AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Empowering learners with AI-driven personalized education pathways
          </p>
        </div>

        <div className="space-y-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              LearnPath AI is dedicated to democratizing quality education by providing personalized learning 
              pathways powered by artificial intelligence. We believe that everyone deserves access to education 
              that is tailored to their unique needs, goals, and circumstances.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Advanced algorithms analyze your profile to recommend the best learning paths
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Learn from thousands of learners and share your journey with the community
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Quality Content</h3>
              <p className="text-muted-foreground">
                Curated courses from top providers ensuring the best learning experience
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Career Growth</h3>
              <p className="text-muted-foreground">
                Pathways aligned with industry demands and job market trends
              </p>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <h2 className="text-2xl font-bold text-foreground mb-4">How We Help</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Personalized Recommendations:</strong> Our AI engine analyzes 
                your skills, interests, and goals to suggest the most relevant learning pathways.
              </p>
              <p>
                <strong className="text-foreground">NSQF Aligned:</strong> All pathways are aligned with the 
                National Skills Qualifications Framework, ensuring recognized certifications.
              </p>
              <p>
                <strong className="text-foreground">Job Market Insights:</strong> We provide real-time information 
                about skill demand and job opportunities in your chosen field.
              </p>
              <p>
                <strong className="text-foreground">Continuous Support:</strong> Track your progress, get feedback, 
                and adjust your learning path as you grow.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
