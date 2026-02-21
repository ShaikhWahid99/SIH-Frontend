// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { PathwayCard } from "@/components/shared/PathwayCard";
// import { Link } from "react-router-dom";
// import { Sparkles } from "lucide-react";

// const recommendedCourses = [
//     {
//         id: "r1",
//         title: "AI & Machine Learning Intro",
//         description: "Basics of ML and AI using Python.",
//         duration: "6 Months",
//         nsqfLevel: 5,
//         sector: "Artificial Intelligence",
//         tags: ["Python", "ML", "AI"],
//         skillDemand: "Very High",
//     },
//     {
//         id: "r2",
//         title: "UI/UX Design Essentials",
//         description: "Learn design thinking, wireframes, and prototyping.",
//         duration: "3 Months",
//         nsqfLevel: 2,
//         sector: "Design",
//         tags: ["Figma", "UI", "Design"],
//         skillDemand: "High",
//     },
//     {
//         id: "r3",
//         title: "Full-Stack Web Development",
//         description: "Master frontend and backend using MERN stack.",
//         duration: "9 Months",
//         nsqfLevel: 5,
//         sector: "IT",
//         tags: ["React", "Node.js", "MongoDB"],
//         skillDemand: "Very High",
//     },
//     {
//         id: "r4",
//         title: "Data Analytics Foundation",
//         description: "Analyze data using Excel, SQL, and Power BI.",
//         duration: "4 Months",
//         nsqfLevel: 4,
//         sector: "Data Analytics",
//         tags: ["SQL", "Power BI", "Excel"],
//     },
//     {
//         id: "r5",
//         title: "Cybersecurity Basics",
//         description: "Introduction to network security and ethical hacking.",
//         duration: "5 Months",
//         nsqfLevel: 4,
//         sector: "Cybersecurity",
//         tags: ["Nmap", "Wireshark", "Security"],
//         skillDemand: "High",
//     },
//     {
//         id: "r6",
//         title: "Cloud Computing with AWS",
//         description: "Learn EC2, S3, IAM and cloud operations.",
//         duration: "6 Months",
//         nsqfLevel: 5,
//         sector: "Cloud Computing",
//         tags: ["AWS", "DevOps", "Cloud"],
//     },
//     {
//         id: "r7",
//         title: "Mobile App Development",
//         description: "Build Android apps using Java & Kotlin.",
//         duration: "6 Months",
//         nsqfLevel: 3,
//         sector: "Mobile Development",
//         tags: ["Android", "Java", "Kotlin"],
//     },
// ];

// const RecommendedCoursesPage = () => {
//     return (
//         <div className="space-y-8">

//             <Card className="p-8 bg-gradient-to-r from-primary to-secondary text-white">
//                 <div className="flex items-center gap-3">
//                     <Sparkles className="w-6 h-6" />
//                     <h1 className="text-3xl font-bold">Recommended Courses</h1>
//                 </div>
//                 <p className="text-white/90 text-lg mt-2">
//                     Personalized courses selected for you.
//                 </p>
//             </Card>

//             <div className="grid md:grid-cols-2 gap-6">
//                 {recommendedCourses.map((course) => (
//                     <PathwayCard key={course.id} {...course} />
//                 ))}
//             </div>

//             <Link to="/learner/similar-courses-page">
//                 <Button variant="outline" size="lg" className="w-full mt-4">
//                     View Similar Courses
//                 </Button>
//             </Link>

//         </div>
//     );
// };

// export default RecommendedCoursesPage;


import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PathwayCard, PathwayCardProps } from "@/components/shared/PathwayCard";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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

function normalize(item: unknown): PathwayCardProps {
    const obj = (item ?? {}) as Record<string, unknown>;
    const totalHours = obj.total_hours as string | number | undefined;
    const tags = Array.isArray(obj.tags) ? (obj.tags as string[]) : [];
    const durationRaw = obj.duration as string | undefined;
    const duration = durationRaw ?? (totalHours != null ? `${totalHours} hours` : "N/A");
    const skillDemand = typeof obj.skillDemand === "string" ? (obj.skillDemand as string) : undefined;

    return {
        id: String(obj.id ?? ""),
        title: String(obj.title ?? obj.name ?? "Untitled Pathway"),
        description: String(obj.description ?? ""),
        duration,
        nsqfLevel: Number(obj.nsqfLevel ?? 0),
        sector: String(obj.sector ?? "General"),
        tags,
        skillDemand,
    };
}

const RecommendedCoursesPage = () => {
    const [items, setItems] = useState<PathwayCardProps[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch recommendations asynchronously and then take items 4–10;
    // this update triggers a re-render, replacing the initial static cards.
    useEffect(() => {
        let mounted = true;
        api
            .getRecommendations()
            .then((res) => {
                const recs = Array.isArray(res?.items) ? res.items : [];
                if (!mounted) return;
                const seven = recs.slice(3, 10).map(normalize);
                setItems(seven);
                setLoading(false);
            })
            .catch(() => {
                setItems(recommendedCourses);
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    return (
      <div className="space-y-8">
        {/* Header Card with right-aligned button */}
        {/* <Card className="p-8 bg-gradient-to-r from-primary to-secondary text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6" />
                            <h1 className="text-3xl font-bold">Relevant Qualifications</h1>
                        </div>

                        <p className="text-white/90 text-lg mt-2">
                            Personalized paths selected for you.
                        </p>
                    </div>

                    <Link to="/learner/similar-courses-page">
                        <Button
                            size="lg"
                            className="bg-white/70 text-primary hover:bg-white/90"
                        >
                            View Similar Courses
                        </Button>
                    </Link>
                </div>
            </Card> */}

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))
            : items.map((course) => (
                <PathwayCard key={course.id} {...course} />
              ))}
        </div>
      </div>
    );
};

export default RecommendedCoursesPage;
