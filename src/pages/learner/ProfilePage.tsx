import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/shared/TextInput';
import { SelectInput } from '@/components/shared/SelectInput';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, MapPin, GraduationCap } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    toast({
      title: 'Profile updated',
      description: 'Your profile has been saved successfully.',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <TextInput label="Full Name" value={user?.name} disabled={!isEditing} />
          <TextInput label="Email" value={user?.email} disabled={!isEditing} />
          <SelectInput label="State" placeholder="Select state" options={['Maharashtra', 'Karnataka', 'Tamil Nadu']} />
          <SelectInput label="Qualification" placeholder="Select" options={['Graduate', 'Post Graduate']} />
        </div>

        {isEditing && (
          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
