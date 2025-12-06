import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TagChip } from '@/components/shared/TagChip';
import { ProgressBar } from '@/components/shared/ProgressBar';
import Mindmap from '@/components/shared/Mindmap';
import type { MindmapNode } from '@/components/shared/Mindmap';
import { ModuleTimeline } from '@/components/shared/ModuleTimeline';
import {
  ArrowLeft,
  Clock,
  GraduationCap,
  Briefcase,
  Calendar,
  CheckCircle,
  Loader2,
  GitGraph,
  List,       // ✅ IMPORT ICONS
  LayoutGrid
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

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

// ✅ GRAPH BUILDER (UNCHANGED)
// ... inside pages/learner/PathwayDetailPage.tsx

// Helper to convert Flat Graph Data -> Tree Hierarchy
function buildHierarchy(nodes: any[], links: any[], rootId: string): MindmapNode | null {
  const nodeMap = new Map<string, MindmapNode>();

  nodes.forEach(n => {
    nodeMap.set(n.id, {
      id: n.id,
      title: n.title || n.label || n.name || 'Unknown', // Changed to check n.label as well
      code: n.code,
      // === NEW: Capture the link from backend ===
      link: n.link, 
      children: []
    });
  });

  links.forEach(l => {
    const parent = nodeMap.get(l.source);
    const child = nodeMap.get(l.target);
    if (parent && child) parent.children?.push(child);
  });

  return nodeMap.get(rootId) || null;
}

const PathwayDetailPage = () => {
  const { id } = useParams();
  const { lang, translate } = useLanguage(); // ✅ GLOBAL LANGUAGE

  const [pathway, setPathway] = useState<Pathway | null>(null);
  // ✅ STATE FOR VIEW TOGGLE
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  
  // ✅ STATE FOR DATA
  const [graphData, setGraphData] = useState<MindmapNode | null>(null);
  const [flatModules, setFlatModules] = useState<any[]>([]); // Store raw list for Timeline
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ ORIGINAL UI TEXT
  const originalText = {
    back: 'Back to Pathways',
    duration: 'Duration',
    nsqf: 'NSQF Level',
    sector: 'Sector',
    validTill: 'Valid Till',
    moduleMap: 'Module Map',
    explore: 'Explore the connections between modules in this qualification.',
    yourProgress: 'Your Progress',
    stepsCompleted: 'steps completed',
    learningPath: 'Learning Path',
    completed: 'Completed',
    inProgress: 'In Progress',
    review: 'Review',
    continue: 'Continue',
    start: 'Start',
    jobOpportunities: 'Job Opportunities',
    skillDemand: 'Skill Demand',
    notFound: 'Pathway not found'
  };

  const [uiText, setUiText] = useState(originalText);

  // ✅ AUTO TRANSLATE UI
  useEffect(() => {
    let mounted = true;

    async function translateUI() {
      if (lang === 'en') {
        mounted && setUiText(originalText);
        return;
      }

      const translated: any = {};
      for (const key in originalText) {
        translated[key] = await translate(originalText[key as keyof typeof originalText]);
      }

      mounted && setUiText(translated);
    }

    translateUI();
    return () => {
      mounted = false;
    };
  }, [lang]);

// FETCH DATA
  useEffect(() => {
    if (!id) return;

    api.getPathwayById(id)
      .then((data) => {
        setPathway({
          ...data,
          mode: data.mode || 'Online',
          steps: data.steps || [],
          jobOpportunities: data.jobOpportunities || ['Data Analyst']
        });
        return api.getPathwayGraph(id);
      })
      .then((res) => {
        if (res?.nodes?.length) {
          // 1. Build Hierarchy for Graph View (Unchanged)
          const hierarchy = buildHierarchy(res.nodes, res.links, id);
          setGraphData(hierarchy);

          // 2. List Logic (UPDATED)
          const modules = res.nodes
            // ✅ FILTER: Exclude the node that matches the current Page ID (the Root)
            .filter((n: any) => n.id !== id) 
            .map((n: any) => ({
               id: n.id,
               title: n.title || n.label || n.name,
               code: n.code,
               link: n.link
            }));
            
          setFlatModules(modules);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(uiText.notFound);
        setLoading(false);
      });
  }, [id]);

  if (error || !pathway) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">{uiText.notFound}</h2>
        <Link to="/learner/pathways">
          <Button>{uiText.back}</Button>
        </Link>
      </div>
    );
  }

  const completedSteps = 0;
  const totalSteps = pathway.steps?.length || 1;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">

      {/* ✅ HEADER */}
      <Link to="/learner/pathways" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        {uiText.back}
      </Link>

      <h1 className="text-3xl font-bold">{pathway.title}</h1>

      <p className="text-muted-foreground">{pathway.description}</p>

      {/* ✅ KEY INFO */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Clock className="w-4 h-4 inline" /> {uiText.duration}
          <p className="font-bold">{pathway.duration}</p>
        </Card>

        <Card className="p-4">
          <GraduationCap className="w-4 h-4 inline" /> {uiText.nsqf}
          <p className="font-bold">Level {pathway.nsqfLevel}</p>
        </Card>

        <Card className="p-4">
          <Briefcase className="w-4 h-4 inline" /> {uiText.sector}
          <p className="font-bold">{pathway.sector}</p>
        </Card>

        <Card className="p-4">
          <Calendar className="w-4 h-4 inline" /> {uiText.validTill}
          <p className="font-bold">{pathway.validTill || 'N/A'}</p>
        </Card>
      </div>

{/* ✅ MODULE MAP SECTION */}
      {graphData && (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {viewMode === 'graph' ? <GitGraph className="w-5 h-5" /> : <List className="w-5 h-5" />} 
                {uiText.moduleMap}
              </h2>
              <p className="text-sm text-muted-foreground">{uiText.explore}</p>
            </div>
            
            {/* ✅ VIEW TOGGLE BUTTONS */}
            <div className="bg-muted p-1 rounded-lg flex gap-1">
               <Button 
                 variant={viewMode === 'graph' ? 'secondary' : 'ghost'} 
                 size="sm" 
                 onClick={() => setViewMode('graph')}
                 className="gap-2"
               >
                 <GitGraph className="w-4 h-4" /> Graph
               </Button>
               <Button 
                 variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                 size="sm" 
                 onClick={() => setViewMode('list')}
                 className="gap-2"
               >
                 <List className="w-4 h-4" /> List
               </Button>
            </div>
          </div>

          <div className="mt-4 transition-all duration-300">
            {viewMode === 'graph' ? (
              <div className="h-[600px] border rounded-xl overflow-hidden bg-slate-50">
                <Mindmap data={graphData} width={1000} height={600} />
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl min-h-[400px]">
                {/* ✅ RENDER LIST VIEW */}
                <ModuleTimeline modules={flatModules} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ✅ PROGRESS */}
      <Card className="p-6">
        <h2 className="text-xl font-bold">{uiText.yourProgress}</h2>
        <ProgressBar value={progress} label={`${completedSteps} ${uiText.stepsCompleted}`} />
      </Card>

      {/* ✅ JOB OPPORTUNITIES */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">{uiText.jobOpportunities}</h2>
        {pathway.jobOpportunities?.map((job, i) => (
          <Badge key={i}>{job}</Badge>
        ))}
        <p className="mt-4">
          {uiText.skillDemand}: <b>{pathway.skillDemand}</b>
        </p>
      </Card>
    </div>
  );
};

export default PathwayDetailPage;
