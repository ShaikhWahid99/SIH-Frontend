import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const ProgressPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">My Progress</h1>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Overall Progress</h2>
        <ProgressBar value={35} label="Pathway Completion" />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Completed Steps</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
              <div className="flex-1">
                <h3 className="font-semibold">Course {i}</h3>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <Badge className="bg-success/10 text-success">Done</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProgressPage;
