import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TagChip } from '@/components/shared/TagChip';
import { ProgressBar } from '@/components/shared/ProgressBar';
import Mindmap from '@/components/shared/Mindmap';
import type { MindmapNode } from '@/components/shared/Mindmap';
import { ArrowLeft, Clock, GraduationCap, Briefcase, Calendar, CheckCircle, Circle, Loader2, GitGraph } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Pathway {
  id: string;
  title: string;
  nqrCode?: string;
  description: string;
  duration: string;
  nsqfLevel: number;
  sector: string;
  validTill?: string;
  mode: string;
  skillDemand: string;
  tags: string[];
  steps?: any[];
  jobOpportunities?: string[];
}

// Helper to convert Flat Graph Data -> Tree Hierarchy
function buildHierarchy(nodes: any[], links: any[], rootId: string): MindmapNode | null {
  const nodeMap = new Map<string, MindmapNode>();

  // 1. Create all node objects
  nodes.forEach(n => {
    nodeMap.set(n.id, {
      id: n.id,
      title: n.title || n.name || 'Unknown',
      code: n.code, // capture code if exists for sorting
      children: []
    });
  });

  // 2. Build relationships
  links.forEach(l => {
    const parent = nodeMap.get(l.source);
    const child = nodeMap.get(l.target);
    if (parent && child) {
      parent.children?.push(child);
    }
  });

  // 3. Return the root node
  return nodeMap.get(rootId) || null;
}

const PathwayDetailPage = () => {
  const { id } = useParams();
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [graphData, setGraphData] = useState<MindmapNode | null>(null); // State for Mindmap
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    // 1. Fetch Pathway Details
    api.getPathwayById(id)
      .then((data) => {
        setPathway({
          ...data,
          mode: data.mode || 'Online', 
          steps: data.steps || [
             { title: 'Introduction', provider: 'Internal', duration: '2h', nsqfLevel: 1, mode: 'Online' },
             { title: 'Core Concepts', provider: 'Internal', duration: '4h', nsqfLevel: 2, mode: 'Online' }
          ],
          jobOpportunities: data.jobOpportunities || ['Data Analyst', 'Junior Developer'] 
        });
        
        // 2. Fetch Graph Data (After details load, to ensure we have the ID context)
        return api.getPathwayGraph(id);
      })
      .then((res) => {
        // Convert flat graph to hierarchy
        if (res && res.nodes && res.nodes.length > 0) {
          const rootNodeId = id; // The current pathway ID is the root
          // Fallback: If ID mismatch in graph (rare), find node with type='root' or just first one
          const hierarchy = buildHierarchy(res.nodes, res.links, rootNodeId);
          setGraphData(hierarchy);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        // Don't fail the whole page if graph fails, just show error in console or handle gracefully
        if (!pathway) setError('Failed to load pathway');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pathway) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Pathway not found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link to="/learner/pathways">
          <Button>Back to Pathways</Button>
        </Link>
      </div>
    );
  }

  const completedSteps = 0; 
  const totalSteps = pathway.steps?.length || 1; 
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/learner/pathways" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Pathways
        </Link>
        
        <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{pathway.title}</h1>
              {pathway.skillDemand && (
                 <Badge className="bg-success text-success-foreground">{pathway.skillDemand}</Badge>
              )}
            </div>

            {pathway.nqrCode && (
              <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                NQR Code: {pathway.nqrCode}
              </div>
            )}

            <p className="text-lg text-muted-foreground">{pathway.description}</p>
            <div className="flex flex-wrap gap-2">
              {pathway.tags.map((tag) => (
                <TagChip key={tag} label={tag} variant="primary" />
              ))}
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
            <span className="text-sm">Sector</span>
          </div>
          <p className="text-lg font-bold text-foreground truncate" title={pathway.sector}>
            {pathway.sector}
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Valid Till</span>
          </div>
          <p className="text-lg font-bold text-foreground">{pathway.validTill || 'N/A'}</p>
        </Card>
      </div>

      {/* NEW SECTION: Learning Graph (Vertical) */}
      {graphData && (
        <Card className="p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <GitGraph className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Module Map</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Explore the connections between modules in this qualification. Scroll to zoom, drag to pan.
          </p>
          <div className="h-[600px] border rounded-lg bg-slate-50 relative">
             <Mindmap data={graphData} width={1000} height={600} />
          </div>
        </Card>
      )}

      {/* Progress */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Your Progress</h2>
        <ProgressBar value={progress} label={`${completedSteps} of ${totalSteps} steps completed`} />
      </Card>

      {/* Learning Path Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Learning Path</h2>
        <div className="space-y-4">
          {pathway.steps?.map((step, index) => {
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
                  {index < (pathway.steps?.length || 0) - 1 && (
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
          {pathway.jobOpportunities?.map((job, index) => (
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