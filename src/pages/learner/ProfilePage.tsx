import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { TextInput } from "@/components/shared/TextInput";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  // ✅ GLOBAL LANGUAGE
  const { lang, setLang, translate } = useLanguage();

  // ✅ ORIGINAL UI TEXT (ENGLISH SOURCE)
  const originalText = {
    title: "My Profile",
    editBtn: "Edit Profile",
    saveBtn: "Save Changes",
    cancelBtn: "Cancel",
    clearBtn: "Clear Profile",
    clearConfirmTitle: "Erase your profile data?",
    clearConfirmDesc:
      "This will remove your saved details from the database. This action cannot be undone.",
    clearConfirmAction: "Erase Data",
    clearConfirmCancel: "Keep Data",
    personalDetails: "Personal Details",
    educationTitle: "Education & Interests",

    fullName: "Full Name",
    email: "Email",
    ageRange: "Age Range",

    educationLevel: "Education Level",
    stream: "Stream",
    status: "Current Status",
    skills: "Skills",
    interests: "Interests",
    goals: "Career Goals",
  };

  const [uiText, setUiText] = useState(originalText);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
    role: "learner",
    ageRange: "",
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
      role: "learner",
      ageRange: details?.ageRange || "",
      education: details?.education?.highestQualification || "",
      stream: details?.education?.stream || "",
      experience: details?.education?.status || "",
      interests: Array.isArray(details?.interestSectors)
        ? details.interestSectors.join(", ")
        : "",
      goals: details?.careerGoal || "",
      skills: Array.isArray(details?.skills) ? details.skills.join(", ") : "",
    });
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleConfirmClear = async () => {
    try {
      await api.clearProfile();
      await refreshUser();
      toast({
        title: "Profile cleared",
        description: "Your details were removed.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to clear",
        description: err?.message || "Unable to erase profile.",
        variant: "destructive",
      });
    } finally {
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ✅ ✅ ✅ GLOBAL LANGUAGE SWITCH (WORKING) */}
      {/* <div className="flex justify-end gap-2">
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
      </div> */}

      {/* ✅ HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{uiText.title}</h1>

        {!isEditing ? (
          <div className="flex gap-2">
            <AlertDialog
              open={showClearConfirm}
              onOpenChange={setShowClearConfirm}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">{uiText.clearBtn}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {uiText.clearConfirmTitle}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {uiText.clearConfirmDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {uiText.clearConfirmCancel}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmClear}>
                    {uiText.clearConfirmAction}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
              <TextInput
                label={uiText.fullName}
                value={profile.name}
                readOnly
              />
              {profile.email && (
                <TextInput
                  label={uiText.email}
                  value={profile.email}
                  readOnly
                />
              )}
              <TextInput
                label={uiText.ageRange}
                value={profile.ageRange}
                readOnly
              />
            </div>
          </div>

          {/* ✅ EDUCATION & INTERESTS */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {uiText.educationTitle}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label={uiText.educationLevel}
                value={profile.education}
                readOnly
              />
              <TextInput
                label={uiText.stream}
                value={profile.stream}
                readOnly
              />
              <TextInput
                label={uiText.status}
                value={profile.experience}
                readOnly
              />
              <TextInput
                label={uiText.skills}
                value={profile.skills}
                readOnly
              />
              <TextInput
                label={uiText.interests}
                value={profile.interests}
                readOnly
              />
              <TextInput label={uiText.goals} value={profile.goals} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
