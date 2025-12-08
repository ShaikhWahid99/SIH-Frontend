// src/pages/learner/JobsPage.tsx
import React, { useEffect, useState } from 'react';
import { api, Job } from '@/lib/api';
import { JobWidget } from '@/components/shared/JobWidget';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Ensure you have shadcn Select or use standard HTML select

// Fallback if shadcn select is missing, you can replace with standard <select> logic
const SECTORS = [
  "IT-ITeS",
  "Media & Entertainment",
  "BFSI",
  "Healthcare",
  "Construction",
  "Automotive",
  "Education, Training & Research",
  "Agriculture",
  "Retail",
  "Tourism & Hospitality"
];

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default to IT, but we will try to update it
  const [sector, setSector] = useState<string>("IT-ITeS");

  // 1. On Mount: Try to auto-detect sector from recommendations
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api.getRecommendations()
      .then((res) => {
        if (!mounted) return;
        
        // Try to find the first valid sector from the user's recommendations
        const topItem = res.items?.find((item: any) => item.sector);
        const userSector = topItem?.sector;

        if (userSector) {
          console.log("Auto-detected sector:", userSector);
          setSector(userSector); // This triggers the next useEffect
        } else {
          // If no sector found, just fetch for the default (IT-ITeS)
          fetchJobsForSector("IT-ITeS");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch recommendations:", err);
        fetchJobsForSector("IT-ITeS");
      });

    return () => { mounted = false; };
  }, []);

  // 2. Whenever 'sector' changes, fetch the new jobs
  useEffect(() => {
    fetchJobsForSector(sector);
  }, [sector]);

  const fetchJobsForSector = (sectorName: string) => {
    setLoading(true);
    console.log(`Fetching jobs for: ${sectorName}`);
    
    api.getJobs(sectorName, 50)
      .then((data) => {
        if (data.success) {
          setJobs(data.jobs);
        } else {
          setJobs([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load jobs", err);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary" />
            Job Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Curated opportunities from National Career Service
          </p>
        </div>

        {/* ✅ SECTOR DROPDOWN: Allows Manual Override */}
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">
                Sector:
            </span>
            <div className="w-[250px]">
                {/* Standard HTML Select for maximum compatibility if ShadCN is tricky */}
                <select 
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                >
                    {SECTORS.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="flex justify-between items-center text-sm text-muted-foreground bg-muted/20 p-2 rounded px-4">
         <span>Showing results for: <span className="font-bold text-primary">{sector}</span></span>
         <span>Powered by NCS</span>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobWidget key={job.id} {...job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <h3 className="text-xl font-semibold">No active listings found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find live jobs for <b>{sector}</b> at this moment.
          </p>
          <Button variant="outline" onClick={() => setSector("IT-ITeS")}>
            Try IT-ITeS Instead
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobsPage;