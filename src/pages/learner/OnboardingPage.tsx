import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/shared/Stepper';
import { TextInput } from '@/components/shared/TextInput';
import { SelectInput } from '@/components/shared/SelectInput';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { sectors, skills, qualifications, streams, careerAspirations, diagnosticQuestions } from '@/data/dummyData';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form data
  const [formData, setFormData] = useState({
    ageRange: '',
    state: '',
    district: '',
    language: '',
    qualification: '',
    stream: '',
    status: '',
    selectedSkills: [] as string[],
    interests: [] as string[],
    mode: '',
    budget: '',
    duration: '',
    careerGoal: '',
    quizAnswers: {} as Record<number, string>,
  });

  const steps = [
    { label: 'Basic Details' },
    { label: 'Education' },
    { label: 'Skills' },
    { label: 'Preferences' },
    { label: 'Career Goals' },
    { label: 'Diagnostic Quiz' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Save to localStorage
    localStorage.setItem('onboardingData', JSON.stringify(formData));
    toast({
      title: 'Profile Complete!',
      description: 'Your personalized pathways are being generated...',
    });
    navigate('/learner/dashboard');
  };

  const toggleSkill = (skill: string) => {
    setFormData({
      ...formData,
      selectedSkills: formData.selectedSkills.includes(skill)
        ? formData.selectedSkills.filter((s) => s !== skill)
        : [...formData.selectedSkills, skill],
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter((i) => i !== interest)
        : [...formData.interests, interest],
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Let's Build Your Learning Profile
          </h1>
          <p className="text-muted-foreground">
            This will help us create the perfect learning path for you
          </p>
        </div>

        <Card className="p-8">
          <Stepper steps={steps} currentStep={currentStep} />

          <div className="mt-8 min-h-[400px]">
            {/* Step 1: Basic Details */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Basic Details</h2>
                <SelectInput
                  label="Age Range"
                  placeholder="Select your age range"
                  options={['Under 18', '18-25', '26-35', '36-45', '46+']}
                  value={formData.ageRange}
                  onValueChange={(value) => setFormData({ ...formData, ageRange: value })}
                />
                <TextInput
                  label="State"
                  placeholder="Enter your state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                <TextInput
                  label="District"
                  placeholder="Enter your district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
                <SelectInput
                  label="Preferred Language"
                  placeholder="Select language"
                  options={['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi']}
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                />
              </div>
            )}

            {/* Step 2: Education Background */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Education Background</h2>
                <SelectInput
                  label="Highest Qualification"
                  placeholder="Select qualification"
                  options={qualifications}
                  value={formData.qualification}
                  onValueChange={(value) => setFormData({ ...formData, qualification: value })}
                />
                <SelectInput
                  label="Stream"
                  placeholder="Select stream"
                  options={streams}
                  value={formData.stream}
                  onValueChange={(value) => setFormData({ ...formData, stream: value })}
                />
                <SelectInput
                  label="Current Status"
                  placeholder="Select status"
                  options={['Student', 'Working Professional', 'Job Seeker', 'Freelancer']}
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                />
              </div>
            )}

            {/* Step 3: Skills & Interests */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Skills & Interests</h2>
                <div>
                  <Label className="text-base mb-3 block">Select your current skills</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={formData.selectedSkills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <label htmlFor={skill} className="text-sm cursor-pointer">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-base mb-3 block">Select your interest sectors</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sectors.map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={sector}
                          checked={formData.interests.includes(sector)}
                          onCheckedChange={() => toggleInterest(sector)}
                        />
                        <label htmlFor={sector} className="text-sm cursor-pointer">
                          {sector}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Learning Preferences</h2>
                <div>
                  <Label className="text-base mb-3 block">Preferred Mode</Label>
                  <RadioGroup value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="cursor-pointer">Online</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offline" id="offline" />
                      <Label htmlFor="offline" className="cursor-pointer">Offline</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid" className="cursor-pointer">Hybrid</Label>
                    </div>
                  </RadioGroup>
                </div>
                <SelectInput
                  label="Budget Range (per month)"
                  placeholder="Select budget"
                  options={['Free', 'Under ₹5,000', '₹5,000 - ₹15,000', '₹15,000 - ₹30,000', 'Above ₹30,000']}
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                />
                <SelectInput
                  label="Preferred Duration"
                  placeholder="Select duration"
                  options={['1-3 months', '3-6 months', '6-12 months', '1+ year']}
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                />
              </div>
            )}

            {/* Step 5: Career Goals */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Career Goals</h2>
                <SelectInput
                  label="What is your career aspiration?"
                  placeholder="Select career goal"
                  options={careerAspirations}
                  value={formData.careerGoal}
                  onValueChange={(value) => setFormData({ ...formData, careerGoal: value })}
                />
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Why this matters</h3>
                  <p className="text-sm text-muted-foreground">
                    Your career aspiration helps us recommend pathways that align with your long-term goals 
                    and ensure you develop the right skills for your desired career.
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Diagnostic Quiz */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Quick Assessment</h2>
                <p className="text-muted-foreground mb-6">
                  Answer these questions to help us understand your learning style and preferences better
                </p>
                {diagnosticQuestions.map((q) => (
                  <Card key={q.id} className="p-4">
                    <Label className="text-base font-medium mb-3 block">{q.question}</Label>
                    <RadioGroup
                      value={formData.quizAnswers[q.id]}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          quizAnswers: { ...formData.quizAnswers, [q.id]: value },
                        })
                      }
                    >
                      {q.options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${q.id}-${idx}`} />
                          <Label htmlFor={`q${q.id}-${idx}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
