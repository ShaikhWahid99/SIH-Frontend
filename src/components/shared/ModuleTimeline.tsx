import React from 'react';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimelineNode {
  id: string;
  title: string;
  code?: string;
  link?: string;
  // You can add 'completed' boolean here later if your API returns progress
}

interface ModuleTimelineProps {
  modules: TimelineNode[];
}

export const ModuleTimeline = ({ modules }: ModuleTimelineProps) => {
  // Sort modules by code or title to keep them linear and organized
  const sortedModules = [...modules].sort((a, b) => 
    (a.code || a.title).localeCompare(b.code || b.title)
  );

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800" />

        {sortedModules.map((module, index) => (
          <div key={module.id} className="relative flex gap-6 mb-8 last:mb-0 group">
            
            {/* Timeline Dot */}
            <div className="relative z-10 flex-shrink-0 mt-1">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-950 border-2 border-primary/20 flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all duration-300 shadow-sm">
                <span className="text-sm font-bold text-primary">
                   {/* Use Index or Code */}
                   {index + 1}
                </span>
              </div>
            </div>

            {/* Content Card */}
            <Card className="flex-1 p-4 hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-primary">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                    {module.title}
                  </h3>
                  {module.code && (
                    <span className="text-xs font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {module.code}
                    </span>
                  )}
                </div>
                
                {module.link && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => window.open(module.link, '_blank')}
                  >
                    Start <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};