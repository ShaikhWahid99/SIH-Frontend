import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import Mindmap from '@/components/shared/Mindmap';
import type { MindmapNode } from '@/components/shared/Mindmap';
import { ModuleTimeline } from '@/components/shared/ModuleTimeline';
import { CourseCard } from '@/components/shared/CourseCard';
import { JobWidget, JobProps } from '@/components/shared/JobWidget';
import { Skeleton } from '@/components/ui/skeleton';

import {
  ArrowLeft,
  Clock,
  GraduationCap,
  Briefcase,
  Calendar,
  GitGraph,
  List,
  Sparkles,
  ArrowRight
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

function buildHierarchy(nodes: any[], links: any[], rootId: string): MindmapNode | null {
  const nodeMap = new Map<string, MindmapNode>();
  nodes.forEach(n => {
    nodeMap.set(n.id, {
      id: n.id,
      title: n.title || n.label || n.name || 'Unknown',
      code: n.code,
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
  const { lang, translate } = useLanguage();

  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  
  const [graphData, setGraphData] = useState<MindmapNode | null>(null);
  const [flatModules, setFlatModules] = useState<any[]>([]);
  const [skillIndiaCourses, setSkillIndiaCourses] = useState<any[]>([]);
  
  const [jobs, setJobs] = useState<JobProps[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    jobOpportunities: 'Job Opportunities',
    relatedRoles: 'Related Roles:',
    openPositions: 'Open Positions via NCS',
    viewAllJobs: 'View All Jobs',
    skillDemand: 'Skill Demand',
    notFound: 'Pathway not found',
    skillIndiaTitle: 'Recommended Skill India Courses',
    skillIndiaDesc: 'Government certified courses based on your qualification path.'
  };

  const [uiText, setUiText] = useState(originalText);

  // AUTO TRANSLATE UI
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
    return () => { mounted = false; };
  }, [lang]);

  // FETCH DATA
  useEffect(() => {
    if (!id) return;

    // 1. Fetch Pathway Info & Graph
    api.getPathwayById(id)
      .then((data) => {
        setPathway({
          ...data,
          mode: data.mode || 'Online',
          steps: data.steps || [],
          jobOpportunities: data.jobOpportunities || ['Data Analyst']
        });

        // ✅ Fetch Jobs (We request 4, but slice later to be safe)
        if (data.sector) {
            setLoadingJobs(true);
            api.getJobs(data.sector, 4) 
                .then(res => {
                    if (res.success) setJobs(res.jobs);
                })
                .catch(err => console.error("Job fetch failed", err))
                .finally(() => setLoadingJobs(false));
        }

        return api.getPathwayGraph(id);
      })
      .then((res) => {
        if (res?.nodes?.length) {
          const hierarchy = buildHierarchy(res.nodes, res.links, id);
          setGraphData(hierarchy);

          const modules = res.nodes
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

    // 2. FETCH SKILL INDIA COURSES
    api.getSkillIndiaCourses(id)
      .then((courses) => {
        setSkillIndiaCourses(courses);
      })
      .catch(err => console.error("Failed to load skill india courses", err));

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
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <Link to="/learner/pathways" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        {uiText.back}
      </Link>

      <h1 className="text-3xl font-bold">{pathway.title}</h1>
      <p className="text-muted-foreground">{pathway.description}</p>

      {/* KEY INFO */}
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

      {/* MODULE MAP SECTION */}
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
                <ModuleTimeline modules={flatModules} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 1. SKILL INDIA RECOMMENDATIONS */}
      {skillIndiaCourses.length > 0 && (
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500" />
                {uiText.skillIndiaTitle}
              </h2>
              <p className="text-muted-foreground">{uiText.skillIndiaDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillIndiaCourses.slice(0, 4).map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                isExternal={true}
              />
            ))}
          </div>

          <div className="flex justify-center pt-2 pb-6 border-b">
            <Link to="/learner/skill-india">
              <Button variant="outline" className="gap-2 border-orange-200 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                Explore All Skill India Courses <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 2. ✅ JOB OPPORTUNITIES (Limited to 4) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            {uiText.jobOpportunities}
        </h2>
        
        {/* Live Jobs Grid - 4 Columns */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingJobs ? (
                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
            ) : jobs.length > 0 ? (
                // ✅ FORCE SLICE TO 4 ITEMS
                jobs.slice(0, 4).map(job => (
                    <JobWidget key={job.id} {...job} />
                ))
            ) : (
                <div className="col-span-4 text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">No active job listings found for {pathway.sector}.</p>
                </div>
            )}
        </div>

        {/* View All Button */}
        <div className="text-center pt-2">
            <Link to="/learner/jobs">
                <Button variant="outline">{uiText.viewAllJobs} <ArrowRight className="ml-2 w-4 h-4"/></Button>
            </Link>
        </div>
      </div>

      {/* 3. PROGRESS (Bottom) */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-bold">{uiText.yourProgress}</h2>
        <ProgressBar value={progress} label={`${completedSteps} ${uiText.stepsCompleted}`} />
      </Card>
    </div>
  );
};

export default PathwayDetailPage;