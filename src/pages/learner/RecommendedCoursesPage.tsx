import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PathwayCard } from "@/components/shared/PathwayCard";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const recommendedCourses = [
    {
        id: "r1",
        title: "AI & Machine Learning Intro",
        description: "Basics of ML and AI using Python.",
        duration: "6 Months",
        nsqfLevel: 5,
        sector: "Artificial Intelligence",
        tags: ["Python", "ML", "AI"],
        skillDemand: "Very High",
    },
    {
        id: "r2",
        title: "UI/UX Design Essentials",
        description: "Learn design thinking, wireframes, and prototyping.",
        duration: "3 Months",
        nsqfLevel: 2,
        sector: "Design",
        tags: ["Figma", "UI", "Design"],
        skillDemand: "High",
    },
    {
        id: "r3",
        title: "Full-Stack Web Development",
        description: "Master frontend and backend using MERN stack.",
        duration: "9 Months",
        nsqfLevel: 5,
        sector: "IT",
        tags: ["React", "Node.js", "MongoDB"],
        skillDemand: "Very High",
    },
    {
        id: "r4",
        title: "Data Analytics Foundation",
        description: "Analyze data using Excel, SQL, and Power BI.",
        duration: "4 Months",
        nsqfLevel: 4,
        sector: "Data Analytics",
        tags: ["SQL", "Power BI", "Excel"],
    },
    {
        id: "r5",
        title: "Cybersecurity Basics",
        description: "Introduction to network security and ethical hacking.",
        duration: "5 Months",
        nsqfLevel: 4,
        sector: "Cybersecurity",
        tags: ["Nmap", "Wireshark", "Security"],
        skillDemand: "High",
    },
    {
        id: "r6",
        title: "Cloud Computing with AWS",
        description: "Learn EC2, S3, IAM and cloud operations.",
        duration: "6 Months",
        nsqfLevel: 5,
        sector: "Cloud Computing",
        tags: ["AWS", "DevOps", "Cloud"],
    },
    {
        id: "r7",
        title: "Mobile App Development",
        description: "Build Android apps using Java & Kotlin.",
        duration: "6 Months",
        nsqfLevel: 3,
        sector: "Mobile Development",
        tags: ["Android", "Java", "Kotlin"],
    },
];

const RecommendedCoursesPage = () => {
    return (
        <div className="space-y-8">

            <Card className="p-8 bg-gradient-to-r from-primary to-secondary text-white">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    <h1 className="text-3xl font-bold">Recommended Courses</h1>
                </div>
                <p className="text-white/90 text-lg mt-2">
                    Personalized courses selected for you.
                </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {recommendedCourses.map((course) => (
                    <PathwayCard key={course.id} {...course} />
                ))}
            </div>

            <Link to="/learner/similar-courses-page">
                <Button variant="outline" size="lg" className="w-full mt-4">
                    View Similar Courses
                </Button>
            </Link>

        </div>
    );
};

export default RecommendedCoursesPage;
