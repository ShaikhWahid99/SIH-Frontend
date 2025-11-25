import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TagChip } from '@/components/shared/TagChip';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ArrowLeft, Clock, GraduationCap, Briefcase, CheckCircle, Circle } from 'lucide-react';
import { pathways } from '@/data/dummyData';

const PathwayDetailPage = () => {
  const { id } = useParams();
  const pathway = pathways.find((p) => p.id === id);

  if (!pathway) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Pathway not found</h2>
        <Link to="/learner/pathways">
          <Button>Back to Pathways</Button>
        </Link>
      </div>
    );
  }

  const completedSteps = 2; // Dummy data
  const progress = (completedSteps / pathway.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/learner/pathways" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Pathways
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{pathway.title}</h1>
              <Badge className="bg-success text-success-foreground">{pathway.skillDemand} Demand</Badge>
            </div>
            <p className="text-lg text-muted-foreground">{pathway.description}</p>
            <div className="flex flex-wrap gap-2">
              {pathway.tags.map((tag) => (
                <TagChip key={tag} label={tag} variant="primary" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Duration</span>
          </div>
          <p className="text-lg font-bold text-foreground">{pathway.duration}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm">NSQF Level</span>
          </div>
          <p className="text-lg font-bold text-foreground">Level {pathway.nsqfLevel}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm">Mode</span>
          </div>
          <p className="text-lg font-bold text-foreground">{pathway.mode}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Circle className="w-4 h-4" />
            <span className="text-sm">Progress</span>
          </div>
          <p className="text-lg font-bold text-foreground">{Math.round(progress)}%</p>
        </Card>
      </div>

      {/* Progress */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Your Progress</h2>
        <ProgressBar value={progress} label={`${completedSteps} of ${pathway.steps.length} steps completed`} />
      </Card>

      {/* Learning Path Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Learning Path</h2>
        <div className="space-y-4">
          {pathway.steps.map((step, index) => {
            const isCompleted = index < completedSteps;
            const isCurrent = index === completedSteps;

            return (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  {index < pathway.steps.length - 1 && (
                    <div className={`w-1 h-full ${isCompleted ? 'bg-success' : 'bg-muted'}`} />
                  )}
                </div>
                
                <Card className={`flex-1 p-4 ${isCurrent ? 'border-primary border-2' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                        <span>{step.provider}</span>
                        <span>•</span>
                        <span>{step.duration}</span>
                        <span>•</span>
                        <span>Level {step.nsqfLevel}</span>
                        <span>•</span>
                        <span>{step.mode}</span>
                      </div>
                      {isCompleted && (
                        <Badge className="bg-success/10 text-success">Completed</Badge>
                      )}
                      {isCurrent && (
                        <Badge className="bg-primary/10 text-primary">In Progress</Badge>
                      )}
                    </div>
                    <Button
                      variant={isCurrent ? 'default' : isCompleted ? 'outline' : 'ghost'}
                      size="sm"
                    >
                      {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Job Opportunities */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Job Opportunities</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {pathway.jobOpportunities.map((job, index) => (
            <Card key={index} className="p-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{job}</span>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Skill Demand: <span className="font-semibold text-success">{pathway.skillDemand}</span>
        </p>
      </Card>
    </div>
  );
};

export default PathwayDetailPage;
