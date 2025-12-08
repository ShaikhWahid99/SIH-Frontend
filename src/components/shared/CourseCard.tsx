import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, GraduationCap, Monitor, ExternalLink } from 'lucide-react';
import { TagChip } from './TagChip';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  id: string;
  title: string;
  provider: string;
  duration: string;
  mode: string;
  nsqfLevel: number | string;
  description: string;
  isExternal?: boolean;
  externalLink?: string;
}

export const CourseCard = ({ 
  id, 
  title, 
  provider, 
  duration, 
  mode, 
  nsqfLevel, 
  description, 
  isExternal, 
  externalLink 
}: CourseCardProps) => {

  // ✅ Check if we should show the NSQF badge
  const showNsqf = nsqfLevel && nsqfLevel !== 'N/A' && nsqfLevel !== '0';

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="space-y-4 flex-grow">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{provider}</p>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {/* ✅ Conditionally Render Badge */}
          {showNsqf ? (
            <TagChip label={`Level ${nsqfLevel}`} variant="primary" />
          ) : null}

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Monitor className="w-4 h-4" />
            <span>{mode}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {isExternal && externalLink ? (
          <a href={externalLink} target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2" variant="outline">
              View on Skill India <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        ) : (
          <Link to={`/learner/courses/${id}`}>
            <Button className="w-full">View Details</Button>
          </Link>
        )}
      </div>
    </Card>
  );
};