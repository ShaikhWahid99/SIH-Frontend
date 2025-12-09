import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  sectors,
  skills,
  qualifications,
  streams,
} from "@/data/dummyData";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Sparkles } from "lucide-react";

type FormDataType = {
  ageRange: string;
  qualification: string;
  stream: string;
  status: string;
  selectedSkills: string[];
  interests: string[];
};

const initialForm: FormDataType = {
  ageRange: "",
  qualification: "",
  stream: "",
  status: "",
  selectedSkills: [],
  interests: [],
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth() as any;
  const [saving, setSaving] = useState(false);

  // Form data (hydrate from localStorage if available)
  const [formData, setFormData] = useState<FormDataType>(() => {
    try {
      const raw = localStorage.getItem("onboardingData");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
            ageRange: parsed.ageRange || "",
            qualification: parsed.qualification || "",
            stream: parsed.stream || "",
            status: parsed.status || "",
            selectedSkills: parsed.selectedSkills || [],
            interests: parsed.interests || []
        };
      }
      return initialForm;
    } catch {
      return initialForm;
    }
  });

  const persist = (next: FormDataType) => {
    try {
      localStorage.setItem("onboardingData", JSON.stringify(next));
    } catch {}
  };

  const updateField = (field: keyof FormDataType, value: any) => {
    setFormData((s) => {
      const next = { ...s, [field]: value };
      persist(next);
      return next;
    });
  };

  const toggleSkill = (skill: string, checked: boolean) => {
    setFormData((s) => {
      const selected = checked
        ? Array.from(new Set([...s.selectedSkills, skill]))
        : s.selectedSkills.filter((x) => x !== skill);
      const next = { ...s, selectedSkills: selected };
      persist(next);
      return next;
    });
  };

  const toggleInterest = (interest: string, checked: boolean) => {
    setFormData((s) => {
      const selected = checked
        ? Array.from(new Set([...s.interests, interest]))
        : s.interests.filter((x) => x !== interest);
      const next = { ...s, interests: selected };
      persist(next);
      return next;
    });
  };

  const buildPayloadForApi = (data: FormDataType) => {
    return {
      ageRange: data.ageRange || undefined,
      education: {
        highestQualification: data.qualification || undefined,
        stream: data.stream || undefined,
        status: data.status || undefined,
      },
      skills: data.selectedSkills,
      interestSectors: data.interests,
    };
  };

  const handleSubmit = async () => {
    if (
      !formData.ageRange ||
      !formData.qualification ||
      !formData.stream ||
      !formData.status ||
      (formData.selectedSkills.length === 0 && formData.interests.length === 0)
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one skill or interest.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayloadForApi(formData);
      // This call now triggers the external API in the backend
      await api.postMe(payload);

      try {
        await refreshUser();
      } catch (refreshErr) {
        console.error("refreshUser failed", refreshErr);
      }

      localStorage.removeItem("onboardingData");

      toast({
        title: "Profile saved",
        description: "Your personalized quiz is ready.",
      });

      navigate("/quiz", { replace: true });
    } catch (err: any) {
      console.error("Onboarding submit error", err);
      toast({
        title: "Save failed",
        description: err?.payload?.message || err?.message || "Could not save profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Build Your Learning Profile
          </h1>
          <p className="text-gray-500">
            Complete your profile to get personalized recommendations
          </p>
        </div>

        <Card className="p-8 shadow-xl border-t-4 border-t-blue-500">
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Age Range
                </Label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.ageRange}
                  onChange={(e) => updateField("ageRange", e.target.value)}
                >
                  <option value="">Select Age</option>
                  <option value="Under 18">Under 18</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46+">46+</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Current Status
                </Label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="Student">Student</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Job Seeker">Job Seeker</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Highest Qualification
                </Label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.qualification}
                  onChange={(e) => updateField("qualification", e.target.value)}
                >
                  <option value="">Select Qualification</option>
                  {qualifications.map((qual) => (
                    <option key={qual} value={qual}>
                      {qual}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Stream
                </Label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.stream}
                  onChange={(e) => updateField("stream", e.target.value)}
                >
                  <option value="">Select Stream</option>
                  {streams.map((stream) => (
                    <option key={stream} value={stream}>
                      {stream}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                Current Skills
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      formData.selectedSkills.includes(skill)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => toggleSkill(skill, !formData.selectedSkills.includes(skill))}
                  >
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={formData.selectedSkills.includes(skill)}
                      onCheckedChange={(val) => toggleSkill(skill, Boolean(val))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <label
                      htmlFor={`skill-${skill}`}
                      className="text-sm font-medium cursor-pointer text-gray-700 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                Interested Sectors
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sectors.map((sector) => (
                  <div
                    key={sector}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      formData.interests.includes(sector)
                        ? "bg-purple-50 border-purple-200"
                        : "bg-white border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => toggleInterest(sector, !formData.interests.includes(sector))}
                  >
                    <Checkbox
                      id={`sector-${sector}`}
                      checked={formData.interests.includes(sector)}
                      onCheckedChange={(val) => toggleInterest(sector, Boolean(val))}
                      className="data-[state=checked]:bg-purple-600"
                    />
                    <label
                      htmlFor={`sector-${sector}`}
                      className="text-sm font-medium cursor-pointer text-gray-700 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sector}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button 
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all hover:scale-[1.01]"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Generating your quiz...
                  </div>
                ) : "Complete Profile"}
              </Button>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
