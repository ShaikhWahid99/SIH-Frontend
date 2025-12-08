import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/shared/TextInput";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// SECTORS
const sectors = [
  "Hydrocarbon",
  "IT-ITeS",
  "Infrastructure",
  "Automotive",
  "Persons with Disability",
  "Electronics & HW",
  "Media & Entertainment",
  "Plumbing",
  "Private Security",
  "Paints & Coatings",
  "Construction",
  "Office Administration & Facility Management",
  "Education, Training & Research",
  "Transportation, Logistics & Warehousing",
  "Aerospace & Aviation",
  "Home Management and Caregiving",
  "Tourism & Hospitality",
  "Environmental Science",
  "Handicrafts & Carpets",
  "Agriculture",
  "Food Industry",
  "Capital Goods & Manufacturing",
  "Rubber Industry",
  "BFSI",
  "Iron & Steel",
];

const TrainerLoginPage = () => {
  const [sector, setSector] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { loginTrainer, refreshTrainerSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sector) {
      toast({
        title: "Sector is required",
        description: "Please select a sector.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await loginTrainer({
        email,
        password,
        sector,
      });

      const trainer = await refreshTrainerSession();
      if (!trainer) throw new Error("Profile fetch failed");

      toast({
        title: "Welcome Trainer!",
        description: "Login successful.",
      });

      navigate("/trainer/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.message || "Invalid credentials or sector.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center w-full">
      <Card className="p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Trainer Login</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <TextInput
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <TextInput
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* SECTOR DROPDOWN (NOW LAST FIELD) */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">Select Sector</label>

            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a sector" />
              </SelectTrigger>

              <SelectContent className="max-h-64 overflow-y-auto">
                {sectors.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login as Trainer"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default TrainerLoginPage;
