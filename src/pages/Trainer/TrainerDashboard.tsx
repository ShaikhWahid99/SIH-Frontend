import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const TrainerDashboard = () => {
  const { logoutTrainer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutTrainer();
    navigate("/auth/trainer-login", { replace: true });
  };

  return (
    <div className="space-y-8 p-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your classes, learners, and training progress
          </p>
        </div>

        <Button
          variant="destructive"
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" /> Total Learners
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">42</CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" /> Training Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">8</CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" /> Hours Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">54</CardContent>
        </Card>
      </div>

      {/* TODAY'S SESSIONS */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" /> Today's Sessions
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border rounded p-4">
            <div>
              <h3 className="font-semibold">Web Development - Batch A</h3>
              <p className="text-sm text-muted-foreground">
                10:00 AM – 12:00 PM
              </p>
            </div>
            <Button>Start Session</Button>
          </div>

          <div className="flex justify-between items-center border rounded p-4">
            <div>
              <h3 className="font-semibold">UI/UX Design Basics</h3>
              <p className="text-sm text-muted-foreground">
                2:00 PM – 4:00 PM
              </p>
            </div>
            <Button>Start Session</Button>
          </div>
        </CardContent>
      </Card>

      {/* UPCOMING TASKS */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex justify-between items-center border rounded p-3">
            <p>Review assignments for Batch A</p>
            <Button variant="outline">View</Button>
          </div>

          <div className="flex justify-between items-center border rounded p-3">
            <p>Prepare Module 5 slides</p>
            <Button variant="outline">Open</Button>
          </div>

          <div className="flex justify-between items-center border rounded p-3">
            <p>Schedule next practice session</p>
            <Button variant="outline">Schedule</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerDashboard;
