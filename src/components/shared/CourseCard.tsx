import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, GraduationCap, Monitor } from 'lucide-react';
import { TagChip } from './TagChip';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  id: string;
  title: string;
  provider: string;
  duration: string;
  mode: string;
  nsqfLevel: number;
  description: string;
}

export const CourseCard = ({ id, title, provider, duration, mode, nsqfLevel, description }: CourseCardProps) => {
  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{provider}</p>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          <TagChip label={`Level ${nsqfLevel}`} variant="primary" />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Monitor className="w-4 h-4" />
            <span>{mode}</span>
          </div>
        </div>
        
        <Link to={`/learner/courses/${id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </div>
    </Card>
  );
};
