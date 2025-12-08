import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { CourseCard } from '@/components/shared/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';

export default function SkillIndiaExplorer() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // Helper function to handle the actual API call
  const fetchCourses = useCallback((pageNum: number, searchQuery: string, reset = false) => {
    setLoading(true);
    api.getAllSkillIndiaCourses(pageNum, 12, searchQuery)
      .then(newCourses => {
        if (newCourses.length < 12) setHasMore(false);
        setCourses(prev => reset ? newCourses : [...prev, ...newCourses]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ✅ 1. Initial Load
  useEffect(() => {
    fetchCourses(1, '', true);
  }, [fetchCourses]);

  // ✅ 2. Debounce Logic: Watch 'search' state changes
  useEffect(() => {
    // Only debounce if there is a search term to avoid double-fetching on initial load
    // (Initial load is handled by the useEffect above or could be combined)
    
    const delayDebounceFn = setTimeout(() => {
      // If search is empty, we might want to reset to default list or handled by initial load
      setPage(1);
      setHasMore(true);
      fetchCourses(1, search, true);
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchCourses]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    // Pass current search term so pagination filters correctly
    fetchCourses(nextPage, search, false);
  };

  // Note: We can remove handleSearch submit logic since the effect handles it, 
  // but keeping the form prevents page reload on 'Enter'.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the fetch, this just prevents default form submission
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/learner/pathways">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Skill India Digital Library</h1>
          <p className="text-muted-foreground">Browse the complete catalog of government certified courses.</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleFormSubmit} className="flex gap-2 max-w-md">
        <Input 
          placeholder="Search courses..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit"><Search className="w-4 h-4" /></Button>
      </form>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, idx) => (
          <CourseCard key={`${course.id}-${idx}`} {...course} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button onClick={loadMore} disabled={loading} variant="secondary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Load More Courses
          </Button>
        </div>
      )}
    </div>
  );
}