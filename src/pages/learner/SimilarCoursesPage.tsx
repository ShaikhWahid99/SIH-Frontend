import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PathwayCard } from "@/components/shared/PathwayCard";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const similarCourses = [
  {
    id: "c1",
    title: "Full Stack Web Development",
    description: "Learn frontend and backend development with modern tools.",
    duration: "6 Months",
    nsqfLevel: 4,
    sector: "IT & Software",
    tags: ["JavaScript", "React", "Node.js"],
    skillDemand: "High Demand",
  },
  {
    id: "c2",
    title: "Data Analytics Fundamentals",
    description: "Master Excel, SQL, and Python for data analysis.",
    duration: "4 Months",
    nsqfLevel: 3,
    sector: "Data Science",
    tags: ["Python", "Excel", "SQL"],
    skillDemand: "Growing",
  },
  {
    id: "c3",
    title: "Cybersecurity Basics",
    description: "Understand ethical hacking, networks, and cyber threats.",
    duration: "3 Months",
    nsqfLevel: 4,
    sector: "Cybersecurity",
    tags: ["Networking", "Hacking", "Security"],
    skillDemand: "High Demand",
  },
  {
    id: "c4",
    title: "Digital Marketing Mastery",
    description: "SEO, social media marketing, and analytics overview.",
    duration: "5 Months",
    nsqfLevel: 3,
    sector: "Marketing",
    tags: ["SEO", "SMM", "Branding"],
  },
  {
    id: "c5",
    title: "Cloud Computing with AWS",
    description: "Learn cloud fundamentals, EC2, S3, IAM, and deployments.",
    duration: "4 Months",
    nsqfLevel: 4,
    sector: "Cloud",
    tags: ["AWS", "EC2", "S3"],
    skillDemand: "High Demand",
  },
  {
    id: "c6",
    title: "UI/UX Design Essentials",
    description: "Learn design thinking, wireframes, and prototyping.",
    duration: "3 Months",
    nsqfLevel: 2,
    sector: "Design",
    tags: ["Figma", "Prototyping", "UI"],
  },
  {
    id: "c7",
    title: "AI & Machine Learning Intro",
    description: "Basics of ML, Python, and real-world AI applications.",
    duration: "6 Months",
    nsqfLevel: 5,
    sector: "Artificial Intelligence",
    tags: ["Python", "ML", "AI"],
    skillDemand: "Very High",
  },
];

const SimilarCoursesPage = () => {
  return (
    <div className="space-y-8">

      {/* Header */}
      <Card className="p-8 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Similar Courses</h1>
        </div>
        <p className="text-white/90 text-lg mt-2">
          Explore more learning options that match your interests.
        </p>
      </Card>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {similarCourses.map((course) => (
          <PathwayCard key={course.id} {...course} />
        ))}
      </div>

      {/* Back Button */}
      <div className="mt-4">
        <Link to="/learner/dashboard">
          <Button size="lg" variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>

    </div>
  );
};

export default SimilarCoursesPage;
