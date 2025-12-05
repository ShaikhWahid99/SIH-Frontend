import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PathwayCard, PathwayCardProps } from '@/components/shared/PathwayCard';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Sparkles, TrendingUp, Target, RefreshCw } from 'lucide-react';
import { pathways } from '@/data/dummyData';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

function normalize(item: unknown): PathwayCardProps {
  const obj = (item ?? {}) as Record<string, unknown>;
  const totalHours = obj.total_hours as string | number | undefined;
  const tags = Array.isArray(obj.tags) ? (obj.tags as string[]) : [];
  const durationRaw = obj.duration as string | undefined;
  const duration = durationRaw ?? (totalHours != null ? `${totalHours} hours` : 'N/A');
  const skillDemand = typeof obj.skillDemand === 'string' ? (obj.skillDemand as string) : undefined;

  return {
    id: String(obj.id ?? ''),
    title: String(obj.title ?? obj.name ?? 'Untitled Pathway'),
    description: String(obj.description ?? ''),
    duration,
    nsqfLevel: Number(obj.nsqfLevel ?? 0),
    sector: String(obj.sector ?? 'General'),
    tags,
    skillDemand,
  };
}

const DashboardPage = () => {
  const [recommendedPathway, setRecommendedPathway] = useState<PathwayCardProps | null>(null);
  const [alternativePathways, setAlternativePathways] = useState<PathwayCardProps[]>([]);
  const overallProgress = 35; // Dummy progress

  useEffect(() => {
    let mounted = true;
    api
      .getRecommendations()
      .then((res) => {
        const items = Array.isArray(res?.items) ? res.items : [];
        if (!items.length) return;
        if (!mounted) return;
        const first = normalize(items[0]);
        const rest = items.slice(1, 3).map(normalize);
        setRecommendedPathway(first);
        setAlternativePathways(rest);
      })
      .catch(() => {
        setRecommendedPathway(normalize(pathways[0]));
        setAlternativePathways(pathways.slice(1, 3).map(normalize));
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      {/* <Card className="p-8 bg-gradient-to-r from-primary to-secondary text-white">
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
      </Card> */}

      {/* Progress Overview */}
      {/* <Card className="p-6">
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
      </Card> */}

      {/* Recommended Pathway */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
        </div>
        {recommendedPathway ? (
          <PathwayCard {...recommendedPathway} />
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        )}
        {recommendedPathway ? (
          <div className="mt-4 flex gap-3">
            <Link to={`/learner/pathways/${recommendedPathway.id}`} className="flex-1">
              <Button className="w-full" size="lg">Start Learning</Button>
            </Link>
            <Button variant="outline" size="lg">View All Pathways</Button>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <Button className="flex-1" size="lg" disabled>Start Learning</Button>
            <Button variant="outline" size="lg" disabled>View All Pathways</Button>
          </div>
        )}
      </div>

      {/* Alternative Pathways */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Alternative Pathways</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {alternativePathways.length ? (
            alternativePathways.map((pathway) => (
              <PathwayCard key={pathway.id} {...pathway} />
            ))
          ) : (
            [0, 1].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))
          )}
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
