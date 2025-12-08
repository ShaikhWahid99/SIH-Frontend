import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PathwayCard, PathwayCardProps } from '@/components/shared/PathwayCard';
import { Target } from 'lucide-react'; 
import { pathways } from '@/data/dummyData';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';

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
  
  const { lang, translate } = useLanguage();

  const originalText = {
    recommended: "Recommended for You",
    startLearning: "Start Learning",
    viewAll: "View All Pathways",
    alternative: "Alternative Pathways",
    quickActions: "Quick Actions",
    updateProfile: "Update Profile",
    viewProgress: "View Detailed Progress",
    giveFeedback: "Give Feedback",
  };

  const [uiText, setUiText] = useState(originalText);

  // Translate UI
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
    return () => { mounted = false; };
  }, [lang]);

  // Fetch Data
  useEffect(() => {
    let mounted = true;
    
    api.getRecommendations()
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

    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-8 pb-10">

      {/* RECOMMENDED PATHWAY */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{uiText.recommended}</h2>
        </div>

        {recommendedPathway ? (
          <PathwayCard {...recommendedPathway} />
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        )}

        {recommendedPathway && (
          <div className="mt-4 flex gap-3">
            <Link to={`/learner/pathways/${recommendedPathway.id}`} className="flex-1">
              <Button className="w-full" size="lg">{uiText.startLearning}</Button>
            </Link>
            <Link to="/learner/alternate-pathways">
              <Button variant="outline" size="lg">{uiText.viewAll}</Button>
            </Link>
          </div>
        )}
      </div>

      {/* ALTERNATIVE PATHWAYS */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">{uiText.alternative}</h2>
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
                    <Skeleton className="h-10 w-full" />
                 </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">{uiText.quickActions}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/learner/profile">
            <Button variant="outline" className="w-full justify-start">{uiText.updateProfile}</Button>
          </Link>
          <Link to="/learner/progress">
            <Button variant="outline" className="w-full justify-start">{uiText.viewProgress}</Button>
          </Link>
          <Link to="/learner/feedback">
            <Button variant="outline" className="w-full justify-start">{uiText.giveFeedback}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;