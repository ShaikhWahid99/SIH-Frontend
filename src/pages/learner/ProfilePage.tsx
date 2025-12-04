import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/shared/TextInput";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
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
        ? details!.interestSectors.join(", ")
        : "",
      goals: details?.careerGoal || "",
      skills: Array.isArray(details?.skills) ? details!.skills.join(", ") : "",
    });
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
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
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Full Name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                readOnly={!isEditing}
              />
              {profile.email && (
                <TextInput
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  readOnly={!isEditing}
                />
              )}
              <TextInput
                label="Preferred Language"
                value={profile.language}
                onChange={(e) =>
                  setProfile({ ...profile, language: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="Age Range"
                value={profile.ageRange}
                onChange={(e) =>
                  setProfile({ ...profile, ageRange: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="State"
                value={profile.state}
                onChange={(e) =>
                  setProfile({ ...profile, state: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="District"
                value={profile.district}
                onChange={(e) =>
                  setProfile({ ...profile, district: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="Preferred Language"
                value={profile.language}
                onChange={(e) =>
                  setProfile({ ...profile, language: e.target.value })
                }
                readOnly={!isEditing}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Education & Interests
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Education Level"
                value={profile.education}
                onChange={(e) =>
                  setProfile({ ...profile, education: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="Stream"
                value={profile.stream}
                onChange={(e) =>
                  setProfile({ ...profile, stream: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="Current Status"
                value={profile.experience}
                onChange={(e) =>
                  setProfile({ ...profile, experience: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="Skills"
                value={profile.skills}
                onChange={(e) =>
                  setProfile({ ...profile, skills: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="Interests"
                value={profile.interests}
                onChange={(e) =>
                  setProfile({ ...profile, interests: e.target.value })
                }
                readOnly={!isEditing}
              />
              <TextInput
                label="Career Goals"
                value={profile.goals}
                onChange={(e) =>
                  setProfile({ ...profile, goals: e.target.value })
                }
                readOnly={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
