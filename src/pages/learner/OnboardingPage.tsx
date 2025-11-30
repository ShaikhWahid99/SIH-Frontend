import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle } from "lucide-react";
import {
  sectors,
  skills,
  qualifications,
  streams,
  careerAspirations,
} from "@/data/dummyData";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type FormDataType = {
  ageRange: string;
  state: string;
  district: string;
  language: string;
  qualification: string;
  stream: string;
  status: string;
  selectedSkills: string[];
  interests: string[];
  mode: string;
  budget: string;
  duration: string;
  careerGoal: string;
  quizAnswers: Record<number, string>;
};

const initialForm: FormDataType = {
  ageRange: "",
  state: "",
  district: "",
  language: "",
  qualification: "",
  stream: "",
  status: "",
  selectedSkills: [],
  interests: [],
  mode: "",
  budget: "",
  duration: "",
  careerGoal: "",
  quizAnswers: {},
};

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth() as any; // refreshUser may or may not exist depending on your AuthContext
  const [saving, setSaving] = useState(false);

  // Form data (hydrate from localStorage)
  const [formData, setFormData] = useState<FormDataType>(() => {
    try {
      const raw = localStorage.getItem("onboardingData");
      return raw ? (JSON.parse(raw) as FormDataType) : initialForm;
    } catch {
      return initialForm;
    }
  });

  const steps = [
    { label: "Basic Details", description: "Tell us about yourself" },
    { label: "Education", description: "Your educational background" },
    { label: "Skills", description: "Your skills and interests" },
    { label: "Career Goals", description: "Where you want to go" },
  ];

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

  // toggle helpers: accept optional `checked` value or toggle based on current state
  const toggleSkill = (skill: string, checked?: boolean) => {
    setFormData((s) => {
      const has = s.selectedSkills.includes(skill);
      const willSelect = typeof checked === "boolean" ? checked : !has;
      const selected = willSelect
        ? Array.from(new Set([...s.selectedSkills, skill]))
        : s.selectedSkills.filter((x) => x !== skill);
      const next = { ...s, selectedSkills: selected };
      persist(next);
      return next;
    });
  };

  const toggleInterest = (interest: string, checked?: boolean) => {
    setFormData((s) => {
      const has = s.interests.includes(interest);
      const willSelect = typeof checked === "boolean" ? checked : !has;
      const selected = willSelect
        ? Array.from(new Set([...s.interests, interest]))
        : s.interests.filter((x) => x !== interest);
      const next = { ...s, interests: selected };
      persist(next);
      return next;
    });
  };

  const validateStep = (stepIndex: number) => {
    if (stepIndex === 0) {
      return (
        !!formData.ageRange &&
        !!formData.language &&
        !!formData.state &&
        !!formData.district
      );
    }
    if (stepIndex === 1) {
      return (
        !!formData.qualification && !!formData.stream && !!formData.status
      );
    }
    if (stepIndex === 2) {
      return (
        formData.selectedSkills.length > 0 || formData.interests.length > 0
      );
    }
    if (stepIndex === 3) {
      return !!formData.careerGoal;
    }
    return true;
  };

  // Map frontend formData to backend expected UserDetails shape
  const buildPayloadForApi = (data: FormDataType) => {
    return {
      ageRange: data.ageRange || undefined,
      preferredLanguage: data.language || undefined,
      state: data.state || undefined,
      district: data.district || undefined,
      education: {
        highestQualification: data.qualification || undefined,
        stream: data.stream || undefined,
        status: data.status || undefined,
      },
      skills: Array.isArray(data.selectedSkills) ? data.selectedSkills : [],
      interestSectors: Array.isArray(data.interests) ? data.interests : [],
      careerGoal: data.careerGoal || undefined,
      // other optional fields (mode, budget, duration, quizAnswers) if supported
      mode: data.mode || undefined,
      budget: data.budget || undefined,
      duration: data.duration || undefined,
      quizAnswers:
        data.quizAnswers && Object.keys(data.quizAnswers).length > 0
          ? data.quizAnswers
          : undefined,
    };
  };

const handleSubmit = async () => {
  setSaving(true);
  try {
    const payload = buildPayloadForApi(formData);

    // send onboarding to server
    await api.postMe(payload);
    await refreshUser(
    navigate("/quiz", {replace: true})
    )

    // refresh auth state so user.userDetails is updated before navigation
    try {
      await refreshUser();
    } catch (refreshErr) {
      console.error("refreshUser failed after onboarding save", refreshErr);
      toast({
        title: "Profile saved but update failed",
        description:
          "Profile was saved on the server but we couldn't update your session. Please refresh the page or log in again.",
        variant: "destructive",
      });
      return; // do not navigate — require a successful refresh
    }

    // clear local draft now that it's saved and client state is fresh
    try {
      localStorage.removeItem("onboardingData");
    } catch (e) {
      // ignore localStorage errors
    }

    toast({
      title: "Profile saved",
      description: "Proceeding to the quiz...",
    });

    navigate("/quiz", { replace: true });
  } catch (err: any) {
    console.error("Onboarding submit error", err);
    toast({
      title: "Save failed",
      description:
        err?.payload?.message || err?.message || "Could not save profile. Try again.",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};


  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Complete required fields",
        description: "Please fill the required fields before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((c) => c + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Build Your Learning Profile
          </h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Stepper */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 transition-all ${
                      index === currentStep ? "scale-105" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {index < currentStep ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : index === currentStep ? (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-medium text-sm ${
                          index === currentStep
                            ? "text-blue-600"
                            : index < currentStep
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-8 shadow-lg">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {steps[currentStep].label}
                  </h2>
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="min-h-[250px]">
                {/* Step 1: Basic Details */}
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Age Range
                        </Label>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.ageRange}
                          onChange={(e) => updateField("ageRange", e.target.value)}
                        >
                          <option value="">Select your age range</option>
                          <option value="Under 18">Under 18</option>
                          <option value="18-25">18-25</option>
                          <option value="26-35">26-35</option>
                          <option value="36-45">36-45</option>
                          <option value="46+">46+</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Preferred Language
                        </Label>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.language}
                          onChange={(e) => updateField("language", e.target.value)}
                        >
                          <option value="">Select language</option>
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Telugu">Telugu</option>
                          <option value="Bengali">Bengali</option>
                          <option value="Marathi">Marathi</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          State
                        </Label>
                        <input
                          type="text"
                          placeholder="Enter your state"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.state}
                          onChange={(e) => updateField("state", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          District
                        </Label>
                        <input
                          type="text"
                          placeholder="Enter your district"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.district}
                          onChange={(e) => updateField("district", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Education Background */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Highest Qualification
                      </Label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.qualification}
                        onChange={(e) => updateField("qualification", e.target.value)}
                      >
                        <option value="">Select qualification</option>
                        {qualifications.map((qual) => (
                          <option key={qual} value={qual}>
                            {qual}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Stream
                      </Label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.stream}
                        onChange={(e) => updateField("stream", e.target.value)}
                      >
                        <option value="">Select stream</option>
                        {streams.map((stream) => (
                          <option key={stream} value={stream}>
                            {stream}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Current Status
                      </Label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.status}
                        onChange={(e) => updateField("status", e.target.value)}
                      >
                        <option value="">Select status</option>
                        <option value="Student">Student</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Job Seeker">Job Seeker</option>
                        <option value="Freelancer">Freelancer</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 3: Skills & Interests */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Your Current Skills
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {skills.map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Checkbox
                              id={skill}
                              checked={formData.selectedSkills.includes(skill)}
                              onCheckedChange={(val) => toggleSkill(skill, Boolean(val))}
                            />
                            <label htmlFor={skill} className="text-sm cursor-pointer flex-1">
                              {skill}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Interest Sectors
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {sectors.map((sector) => (
                          <div
                            key={sector}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Checkbox
                              id={sector}
                              checked={formData.interests.includes(sector)}
                              onCheckedChange={(val) => toggleInterest(sector, Boolean(val))}
                            />
                            <label htmlFor={sector} className="text-sm cursor-pointer flex-1">
                              {sector}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Career Goals */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        What is your career aspiration?
                      </Label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.careerGoal}
                        onChange={(e) => updateField("careerGoal", e.target.value)}
                      >
                        <option value="">Select career goal</option>
                        {careerAspirations.map((aspiration) => (
                          <option key={aspiration} value={aspiration}>
                            {aspiration}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        Why this matters
                      </h3>
                      <p className="text-sm text-blue-800">
                        Your career aspiration helps us recommend pathways that align with your long-term goals and ensure you develop the right skills for your desired career.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || saving}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={saving}>
                  {currentStep === steps.length - 1 ? (saving ? "Saving..." : "Complete") : "Next"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
