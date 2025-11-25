import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { PathwayCard } from '@/components/shared/PathwayCard';
import { SelectInput } from '@/components/shared/SelectInput';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { pathways, sectors } from '@/data/dummyData';

const PathwayListPage = () => {
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPathways = pathways.filter((pathway) => {
    if (selectedSector && pathway.sector !== selectedSector) return false;
    if (selectedDuration && pathway.duration !== selectedDuration) return false;
    if (selectedLevel && pathway.nsqfLevel.toString() !== selectedLevel) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedSector('');
    setSelectedDuration('');
    setSelectedLevel('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore Pathways</h1>
          <p className="text-muted-foreground">
            Discover learning pathways tailored to your goals
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
            label="Duration"
            placeholder="Any duration"
            options={['All', '1-3 months', '3-6 months', '6-12 months', '12+ months']}
            value={selectedDuration}
            onValueChange={setSelectedDuration}
          />

          <SelectInput
            label="NSQF Level"
            placeholder="Any level"
            options={['All', '3', '4', '5', '6', '7']}
            value={selectedLevel}
            onValueChange={setSelectedLevel}
          />

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPathways.length} of {pathways.length} pathways
            </p>
          </div>
        </Card>

        {/* Pathway Grid */}
        <div className="lg:col-span-3 space-y-6">
          {filteredPathways.length > 0 ? (
            <div className="grid gap-6">
              {filteredPathways.map((pathway) => (
                <PathwayCard key={pathway.id} {...pathway} />
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
