import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { feedbackIssues } from '@/data/dummyData';

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Feedback submitted',
      description: 'Thank you for your feedback!',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground">Share Your Feedback</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-base mb-3 block">Rate your experience</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base mb-3 block">Any issues?</Label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackIssues.map((issue) => (
                <div key={issue} className="flex items-center space-x-2">
                  <Checkbox id={issue} />
                  <label htmlFor={issue} className="text-sm cursor-pointer">{issue}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="text-base mb-3 block">Additional comments</Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
            />
          </div>

          <Button type="submit" size="lg" className="w-full">Submit Feedback</Button>
        </form>
      </Card>
    </div>
  );
};

export default FeedbackPage;
