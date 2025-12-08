import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, GraduationCap, Monitor, CheckCircle, Loader2, BookOpen, Star, PlayCircle, ExternalLink } from 'lucide-react';
import { api, YouTubeVideo } from '@/lib/api';

// Define the shape of your Neo4j data matching the controller response
interface CourseData {
  id: string;
  title: string;
  code?: string;      // Added code
  credits?: string;   // Added credits
  mandatory?: string; // Added mandatory status
  provider: string;
  duration: string;
  mode: string;
  nsqfLevel: number | string;
  description: string;
  learningOutcomes?: string[];
}

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    // You need to add getCourseById to your api.ts file
    api.getCourseById(id)
      .then((data) => {
        setCourse({
          ...data,
          // Defaults handled in controller, but fail-safes here
          title: data.title || 'Untitled Module',
          provider: data.provider || 'Internal',
          mode: data.mode || 'Offline',
          learningOutcomes: data.learningOutcomes || [],
          duration: data.duration || 'N/A',
          nsqfLevel: data.nsqfLevel || 'N/A'
        });

        if (data.title) {
          setVideoLoading(true);
          api.searchVideos(data.title)
            .then(vidData => setVideos(vidData))
            .catch(err => console.error("Video fetch error", err))
            .finally(() => setVideoLoading(false));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch course:", err);
        setError('Failed to load course details');
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

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Course not found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link to="/learner/pathways">
          <Button>Back to Pathways</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/learner/pathways" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-2">
          {course.code && (
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {course.code}
            </Badge>
          )}
          {course.mandatory && (
            <Badge variant={course.mandatory === 'Elective' ? "secondary" : "default"}>
              {course.mandatory}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{course.title}</h1>
        <p className="text-lg text-muted-foreground">Provided by {course.provider}</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1.5 rounded-md">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-medium">{course.duration}</span>
        </div>
        {course.credits && (
           <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1.5 rounded-md">
             <Star className="w-5 h-5 text-primary" />
             <span className="font-medium">{course.credits} Credits</span>
           </div>
        )}
        <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1.5 rounded-md">
          <Monitor className="w-5 h-5 text-primary" />
          <span className="font-medium">{course.mode}</span>
        </div>
        <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1.5 rounded-md">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="font-medium">Level {course.nsqfLevel}</span>
        </div>
      </div>

      {course.description && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Description
          </h2>
          <p className="text-muted-foreground leading-relaxed">{course.description}</p>
        </Card>
      )}

      {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Learning Outcomes</h2>
          <ul className="space-y-3">
            {course.learningOutcomes.map((outcome, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{outcome}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card className="p-6 bg-muted/30 border-dashed">
          <p className="text-muted-foreground text-center italic">No specific learning outcomes listed for this module.</p>
        </Card>
      )}

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-red-500" /> 
          Recommended Resources
        </h2>
        
        {videoLoading ? (
           <div className="flex gap-2 text-muted-foreground">
             <Loader2 className="w-4 h-4 animate-spin" /> Loading videos...
           </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videos.map((video) => (
              <a 
                key={video.videoId} 
                href={video.url} 
                target="_blank" 
                rel="noreferrer"
                className="group block"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all h-full border-muted-foreground/20">
                  <div className="relative aspect-video bg-black/10">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <PlayCircle className="w-12 h-12 text-white fill-current" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                       <span>YouTube</span>
                       <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic">No related videos found.</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button size="lg" className="flex-1">Enroll Now</Button>
        <Button size="lg" variant="outline">Add to Pathway</Button>
      </div>
    </div>
  );
};

export default CourseDetailPage;