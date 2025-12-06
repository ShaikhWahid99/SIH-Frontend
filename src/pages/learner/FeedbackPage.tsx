import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { feedbackIssues } from '@/data/dummyData';
import { useLanguage } from '@/context/LanguageContext'; // ✅ GLOBAL LANGUAGE

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const { lang, translate } = useLanguage(); // ✅ GLOBAL LANGUAGE

  // ✅ ORIGINAL TEXT (ENGLISH SOURCE)
  const originalText = {
    pageTitle: 'Share Your Feedback',
    rateExperience: 'Rate your experience',
    anyIssues: 'Any issues?',
    additionalComments: 'Additional comments',
    commentPlaceholder: 'Tell us more about your experience...',
    submitBtn: 'Submit Feedback',
    toastTitle: 'Feedback submitted',
    toastDesc: 'Thank you for your feedback!',
  };

  const [uiText, setUiText] = useState(originalText);
  const [issuesText, setIssuesText] = useState<string[]>(feedbackIssues);

  // ✅ AUTO-TRANSLATE UI + ISSUES LIST WHEN LANGUAGE CHANGES
  useEffect(() => {
    let mounted = true;

    async function translateUI() {
      if (lang === 'en') {
        mounted && setUiText(originalText);
        mounted && setIssuesText(feedbackIssues);
        return;
      }

      const translated: any = {};
      for (const key in originalText) {
        translated[key] = await translate(originalText[key as keyof typeof originalText]);
      }

      const translatedIssues = await Promise.all(
        feedbackIssues.map((issue) => translate(issue))
      );

      if (!mounted) return;
      setUiText(translated);
      setIssuesText(translatedIssues);
    }

    translateUI();

    return () => {
      mounted = false;
    };
  }, [lang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: uiText.toastTitle,
      description: uiText.toastDesc,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground">
        {uiText.pageTitle}
      </h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-base mb-3 block">
              {uiText.rateExperience}
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      value <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base mb-3 block">
              {uiText.anyIssues}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {issuesText.map((issue, index) => (
                <div key={feedbackIssues[index]} className="flex items-center space-x-2">
                  {/* ✅ Keep ID stable using original English key */}
                  <Checkbox id={feedbackIssues[index]} />
                  <label
                    htmlFor={feedbackIssues[index]}
                    className="text-sm cursor-pointer"
                  >
                    {issue}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="text-base mb-3 block">
              {uiText.additionalComments}
            </Label>
            <Textarea
              id="comment"
              placeholder={uiText.commentPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            {uiText.submitBtn}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default FeedbackPage;
