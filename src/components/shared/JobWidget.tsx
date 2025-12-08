// src/components/shared/JobWidget.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Building2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface JobProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  apply_link: string;
  description: string;
}

export const JobWidget: React.FC<JobProps> = ({
  title,
  company,
  location,
  salary,
  apply_link,
}) => {
  return (
    <Card className="p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/70">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Building2 className="w-4 h-4" />
          <span className="text-sm font-medium">{company}</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Badge variant="secondary" className="font-normal bg-green-100 text-green-800 hover:bg-green-200">
              ₹ {salary}
            </Badge>
          </div>
        </div>
      </div>

      <Button 
        className="w-full mt-auto group" 
        variant="outline"
        onClick={() => window.open(apply_link, '_blank')}
      >
        Apply Now
        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Card>
  );
};