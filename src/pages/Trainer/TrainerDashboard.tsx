import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const TrainerDashboard = () => {
  const { logoutTrainer, trainer } = useAuth();
  const navigate = useNavigate();

  const [learners, setLearners] = useState<Array<{ id: string; email?: string | null; displayName?: string | null; details?: any | null }>>([]);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logoutTrainer();
    navigate("/auth/trainer-login", { replace: true });
  };

  useEffect(() => {
    let mounted = true;
    async function fetchLearners() {
      try {
        setLoadingLearners(true);
        setError(null);
        const res = await api.trainerGetLearners();
        const list = Array.isArray(res?.learners) ? res.learners : [];
        if (mounted) setLearners(list);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load learners");
      } finally {
        if (mounted) setLoadingLearners(false);
      }
    }
    fetchLearners();
    return () => {
      mounted = false;
    };
  }, []);

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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" /> Learners in Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loadingLearners ? "…" : learners.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Sector: {trainer?.sector || "N/A"}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg">Trainer Information</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <p className="text-sm"><span className="font-medium">Name:</span> {trainer?.displayName || trainer?.email || "—"}</p> */}
            <p className="text-sm"><span className="font-medium">Email:</span> {trainer?.email || "—"}</p>
            <p className="text-sm"><span className="font-medium">Sector:</span> {trainer?.sector || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Learners in Your Sector */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg">
            Learners in {trainer?.sector || "your sector"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-red-600 mb-2">{error}</p>
          )}
          {loadingLearners && !error ? (
            <p className="text-sm text-muted-foreground">Loading learners…</p>
          ) : learners.length === 0 ? (
            <p className="text-sm text-muted-foreground">No learners found for this sector.</p>
          ) : (
            <div className="space-y-2">
              {learners.map((l) => (
                <div key={l.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{l.displayName || l.email || "—"}</p>
                      {l.displayName && (
                        <p className="text-xs text-muted-foreground">ID: {l.id}</p>
                      )}
                    </div>
                    {/* <Button variant="outline">View Profile</Button> */}
                  </div>
                  {l.details && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Location: {l.details.state || "—"}{l.details.district ? ", " + l.details.district : ""}</p>
                      <p>Qualification: {l.details.highestQualification || "—"}</p>
                      <p>Skills: {Array.isArray(l.details.skills) ? l.details.skills.join(", ") || "—" : "—"}</p>
                      <p>Interest Sectors: {Array.isArray(l.details.interestSectors) ? l.details.interestSectors.join(", ") || "—" : "—"}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* End */}
    </div>
  );
};

export default TrainerDashboard;
