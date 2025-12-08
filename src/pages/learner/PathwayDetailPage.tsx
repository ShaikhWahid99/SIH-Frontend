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

// ✅ GRAPH BUILDER (UNCHANGED)
function buildHierarchy(nodes: any[], links: any[], rootId: string): MindmapNode | null {
  const nodeMap = new Map<string, MindmapNode>();

  nodes.forEach(n => {
    nodeMap.set(n.id, {
      id: n.id,
      title: n.title || n.name || 'Unknown',
      code: n.code, // capture code if exists for sorting
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
  const [graphData, setGraphData] = useState<MindmapNode | null>(null); // State for Mindmap
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

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
