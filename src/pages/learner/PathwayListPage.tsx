import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { PathwayCard } from '@/components/shared/PathwayCard';
import { SelectInput } from '@/components/shared/SelectInput';
import { Button } from '@/components/ui/button';
import { Filter, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

// Define structure matching our backend response
interface Qualification {
  id: string;
  title: string;
  description: string;
  nsqf_level: string;
  sector: string;
  total_hours: string;
  nqr_code: string;
}

const PathwayListPage = () => {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSector, setSelectedSector] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.getQualifications();
        setQualifications(data);
      } catch (err) {
        console.error("Failed to fetch qualifications", err);
        setError("Could not load qualifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Extract unique sectors dynamically from the data
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(qualifications.map(q => q.sector).filter(Boolean)));
    return uniqueSectors.sort();
  }, [qualifications]);

  // Filter Logic
  const filteredPathways = qualifications.filter((pathway) => {
    // Filter by Sector
    if (selectedSector && selectedSector !== 'All' && pathway.sector !== selectedSector) return false;
    
    // Filter by NSQF Level
    if (selectedLevel && selectedLevel !== 'All' && pathway.nsqf_level !== selectedLevel) return false;
    
    return true;
  });

  const clearFilters = () => {
    setSelectedSector('');
    setSelectedLevel('');
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore Pathways</h1>
          <p className="text-muted-foreground">
            Discover learning pathways tailored to your goals directly from the National Qualifications Register.
          </p>
        </div>
        <Button
          variant="outline"
          className="md:hidden gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className={`lg:block p-6 space-y-6 lg:col-span-1 ${showFilters ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Filters</h2>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>

          <SelectInput
            label="Sector"
            placeholder="All sectors"
            options={['All', ...sectors]}
            value={selectedSector}
            onValueChange={setSelectedSector}
          />

          <SelectInput
            label="NSQF Level"
            placeholder="Any level"
            options={['All', '3', '4', '5', '6', '7', '8']}
            value={selectedLevel}
            onValueChange={setSelectedLevel}
          />

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPathways.length} of {qualifications.length} pathways
            </p>
          </div>
        </Card>

        {/* Pathway Grid */}
        <div className="lg:col-span-3 space-y-6">
          {filteredPathways.length > 0 ? (
            <div className="grid gap-6">
              {filteredPathways.map((qual) => (
                <PathwayCard 
                  key={qual.id} 
                  id={qual.id}
                  title={qual.title}
                  description={qual.description}
                  duration={`${qual.total_hours || 'N/A'} Hours`}
                  nsqfLevel={parseInt(qual.nsqf_level) || 0}
                  sector={qual.sector}
                  tags={[qual.nqr_code]} // Using NQR code as a tag
                  skillDemand="High" // Defaulting since this isn't in DB yet
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No pathways match your filters. Try adjusting your criteria.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathwayListPage;