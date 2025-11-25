import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { TagChip } from './TagChip';
import { Link } from 'react-router-dom';

interface PathwayCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  nsqfLevel: number;
  sector: string;
  tags: string[];
  skillDemand?: string;
}

export const PathwayCard = ({ 
  id, 
  title, 
  description, 
  duration, 
  nsqfLevel, 
  sector, 
  tags,
  skillDemand 
}: PathwayCardProps) => {
  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            {skillDemand && (
              <div className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {skillDemand}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{sector}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} label={tag} variant="primary" />
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Level {nsqfLevel}</span>
            </div>
          </div>
          
          <Link to={`/learner/pathways/${id}`}>
            <Button variant="ghost" size="sm" className="group-hover:text-primary">
              View Details
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
