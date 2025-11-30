import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/shared/TextInput";
import { SelectInput } from "@/components/shared/SelectInput";
import { User } from "lucide-react";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    mobile: "+1234567890",
    language: "en",
    role: "learner",
    education: "Bachelor's Degree",
    experience: "3-5 years",
    interests: "Web Development, Data Science",
    goals: "Become a Full Stack Developer",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Frontend only - no backend save
  };

  const handleLanguageChange = (value: string) => {
    setProfile({ ...profile, language: value });
  };

  const languageLabels: { [key: string]: string } = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
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
          <div className="grid md:grid-cols-2 gap-6">
            <TextInput
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              readOnly={!isEditing}
            />
            <TextInput
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              readOnly={!isEditing}
            />
            <TextInput
              label="Mobile"
              value={profile.mobile}
              onChange={(e) =>
                setProfile({ ...profile, mobile: e.target.value })
              }
              readOnly={!isEditing}
            />
            <div>
              <SelectInput
                label="Language"
                value={profile.language}
                onValueChange={handleLanguageChange}
                options={["en", "es", "fr", "de"]}
                disabled={!isEditing}
              />
              <div className="text-sm text-muted-foreground mt-1">
                {languageLabels[profile.language]}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Learning Details</h3>
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
                label="Experience"
                value={profile.experience}
                onChange={(e) =>
                  setProfile({ ...profile, experience: e.target.value })
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
