import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, GraduationCap, Monitor, CheckCircle } from 'lucide-react';
import { courses } from '@/data/dummyData';

const CourseDetailPage = () => {
  const { id } = useParams();
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Course not found</h2>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">{course.title}</h1>
        <p className="text-lg text-muted-foreground">{course.provider}</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-muted-foreground" />
          <span>{course.mode}</span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-muted-foreground" />
          <span>NSQF Level {course.nsqfLevel}</span>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-3">Course Description</h2>
        <p className="text-muted-foreground">{course.description}</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Learning Outcomes</h2>
        <ul className="space-y-2">
          {course.learningOutcomes.map((outcome, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <span className="text-muted-foreground">{outcome}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex gap-3">
        <Button size="lg" className="flex-1">Enroll Now</Button>
        <Button size="lg" variant="outline">Add to Pathway</Button>
      </div>
    </div>
  );
};

export default CourseDetailPage;
