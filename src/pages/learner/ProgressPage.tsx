import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext'; // ✅ GLOBAL LANGUAGE

const ProgressPage = () => {
  const { lang, translate } = useLanguage(); // ✅ GLOBAL LANGUAGE

  // ✅ ORIGINAL UI TEXT
  const originalText = {
    pageTitle: 'My Progress',
    overallProgress: 'Overall Progress',
    pathwayCompletion: 'Pathway Completion',
    completedSteps: 'Completed Steps',
    completed: 'Completed',
    done: 'Done',
    course: 'Course',
  };

  const [uiText, setUiText] = useState(originalText);

  // ✅ AUTO TRANSLATE WHEN LANGUAGE CHANGES
  useEffect(() => {
    let mounted = true;

    async function translateUI() {
      if (lang === 'en') {
        mounted && setUiText(originalText);
        return;
      }

      const translated: any = {};
      for (const key in originalText) {
        translated[key] = await translate(
          originalText[key as keyof typeof originalText]
        );
      }

      mounted && setUiText(translated);
    }

    translateUI();

    return () => {
      mounted = false;
    };
  }, [lang]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        {uiText.pageTitle}
      </h1>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {uiText.overallProgress}
        </h2>
        <ProgressBar value={35} label={uiText.pathwayCompletion} />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">
          {uiText.completedSteps}
        </h2>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
            >
              <CheckCircle className="w-6 h-6 text-success" />

              <div className="flex-1">
                <h3 className="font-semibold">
                  {uiText.course} {i}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {uiText.completed}
                </p>
              </div>

              <Badge className="bg-success/10 text-success">
                {uiText.done}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProgressPage;
