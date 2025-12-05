import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/shared/TextInput";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  // ✅ GLOBAL LANGUAGE
  const { lang, setLang, translate } = useLanguage();

  // ✅ ORIGINAL UI TEXT (ENGLISH SOURCE)
  const originalText = {
    title: "My Profile",
    editBtn: "Edit Profile",
    saveBtn: "Save Changes",
    cancelBtn: "Cancel",
    personalDetails: "Personal Details",
    educationTitle: "Education & Interests",

    fullName: "Full Name",
    email: "Email",
    preferredLanguage: "Preferred Language",
    ageRange: "Age Range",
    state: "State",
    district: "District",

    educationLevel: "Education Level",
    stream: "Stream",
    status: "Current Status",
    skills: "Skills",
    interests: "Interests",
    goals: "Career Goals",
  };

  const [uiText, setUiText] = useState(originalText);

  // ✅ ✅ ✅ FIXED AUTO TRANSLATION (USES GLOBAL TRANSLATE)
  useEffect(() => {
    let mounted = true;

    async function translateUI() {
      if (lang === "en") {
        mounted && setUiText(originalText);
        return;
      }

      const translated: typeof originalText = {} as any;

      for (const key in originalText) {
        translated[key as keyof typeof originalText] = await translate(
          originalText[key as keyof typeof originalText]
        );
      }

      mounted && setUiText(translated);
    }

    translateUI();

    return () => {
      mounted = false;
    };
  }, [lang]);

  // ✅ PROFILE DATA
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    language: "",
    role: "learner",
    ageRange: "",
    state: "",
    district: "",
    education: "",
    stream: "",
    experience: "",
    interests: "",
    goals: "",
    skills: "",
  });

  useEffect(() => {
    const details = user?.userDetails || null;

    setProfile({
      name: user?.displayName || "",
      email: user?.email || "",
      language: details?.preferredLanguage || "",
      role: "learner",
      ageRange: details?.ageRange || "",
      state: details?.state || "",
      district: details?.district || "",
      education: details?.education?.highestQualification || "",
      stream: details?.education?.stream || "",
      experience: details?.education?.status || "",
      interests: Array.isArray(details?.interestSectors)
        ? details.interestSectors.join(", ")
        : "",
      goals: details?.careerGoal || "",
      skills: Array.isArray(details?.skills)
        ? details.skills.join(", ")
        : "",
    });
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ✅ ✅ ✅ GLOBAL LANGUAGE SWITCH (WORKING) */}
      <div className="flex justify-end gap-2">
        <Button
          variant={lang === "en" ? "default" : "outline"}
          onClick={() => setLang("en")}
        >
          EN
        </Button>

        <Button
          variant={lang === "hi" ? "default" : "outline"}
          onClick={() => setLang("hi")}
        >
          HI
        </Button>

        <Button
          variant={lang === "mr" ? "default" : "outline"}
          onClick={() => setLang("mr")}
        >
          MR
        </Button>
      </div>

      {/* ✅ HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{uiText.title}</h1>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            {uiText.editBtn}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>{uiText.saveBtn}</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {uiText.cancelBtn}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>

            <div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <p className="text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ✅ PERSONAL DETAILS */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {uiText.personalDetails}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <TextInput label={uiText.fullName} value={profile.name} readOnly />
              {profile.email && (
                <TextInput label={uiText.email} value={profile.email} readOnly />
              )}
              <TextInput label={uiText.preferredLanguage} value={profile.language} readOnly />
              <TextInput label={uiText.ageRange} value={profile.ageRange} readOnly />
              <TextInput label={uiText.state} value={profile.state} readOnly />
              <TextInput label={uiText.district} value={profile.district} readOnly />
            </div>
          </div>

          {/* ✅ EDUCATION & INTERESTS */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {uiText.educationTitle}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <TextInput label={uiText.educationLevel} value={profile.education} readOnly />
              <TextInput label={uiText.stream} value={profile.stream} readOnly />
              <TextInput label={uiText.status} value={profile.experience} readOnly />
              <TextInput label={uiText.skills} value={profile.skills} readOnly />
              <TextInput label={uiText.interests} value={profile.interests} readOnly />
              <TextInput label={uiText.goals} value={profile.goals} readOnly />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
