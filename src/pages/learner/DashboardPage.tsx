import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PathwayCard } from '@/components/shared/PathwayCard';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Sparkles, TrendingUp, Target, RefreshCw } from 'lucide-react';
import { pathways } from '@/data/dummyData';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const recommendedPathway = pathways[0];
  const alternativePathways = pathways.slice(1, 3);
  const overallProgress = 35; // Dummy progress

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="p-8 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>
            </div>
            <p className="text-white/90 text-lg">
              Your personalized pathway is ready! Let's continue your journey to success.
            </p>
          </div>
          <Button variant="secondary" size="lg" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Regenerate Path
          </Button>
        </div>
      </Card>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Overall Progress</h2>
          </div>
          <span className="text-sm text-muted-foreground">Keep going!</span>
        </div>
        <ProgressBar value={overallProgress} label="Pathway Completion" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">Courses Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">12</div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">9</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
        </div>
      </Card>

      {/* Recommended Pathway */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
        </div>
        <PathwayCard {...recommendedPathway} />
        <div className="mt-4 flex gap-3">
          <Link to={`/learner/pathways/${recommendedPathway.id}`} className="flex-1">
            <Button className="w-full" size="lg">Start Learning</Button>
          </Link>
          <Button variant="outline" size="lg">View All Pathways</Button>
        </div>
      </div>

      {/* Alternative Pathways */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Alternative Pathways</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {alternativePathways.map((pathway) => (
            <PathwayCard key={pathway.id} {...pathway} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/learner/profile">
            <Button variant="outline" className="w-full justify-start">
              Update Profile
            </Button>
          </Link>
          <Link to="/learner/progress">
            <Button variant="outline" className="w-full justify-start">
              View Detailed Progress
            </Button>
          </Link>
          <Link to="/learner/feedback">
            <Button variant="outline" className="w-full justify-start">
              Give Feedback
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
