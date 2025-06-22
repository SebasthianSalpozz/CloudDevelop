import React, { useEffect, useState } from 'react';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import { UserRepository, type UserProfile } from '../repositories/UserRepository';
import Card from './Card';
import Button from './Button';

export const FollowUsers: React.FC = () => {
  const { user } = useFirebaseUser();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const repo = new UserRepository();
      const allUsers = await repo.getAllUsers();
      const profile = await repo.getUserProfile(user.uid);
      setUsers(allUsers.filter((u) => u.uid !== user.uid));
      setCurrentUserProfile(profile);
    };
    loadData();
  }, [user]);

  const handleFollow = async (followedId: string) => {
    if (!user) return;
    const repo = new UserRepository();
    await repo.followUser(user.uid, followedId);
    setCurrentUserProfile({
      ...currentUserProfile!,
      following: [...(currentUserProfile?.following || []), followedId],
    });
  };

  const handleUnfollow = async (followedId: string) => {
    if (!user) return;
    const repo = new UserRepository();
    await repo.unfollowUser(user.uid, followedId);
    setCurrentUserProfile({
      ...currentUserProfile!,
      following: (currentUserProfile?.following || []).filter((id) => id !== followedId),
    });
  };

  if (!users.length) return <p>No hay usuarios disponibles.</p>;

  return (
    <div className="space-y-4">
      {users.map((u) => (
        <Card key={u.uid} title={u.fullName}>
          <div className="flex gap-2 mt-2">
            {currentUserProfile?.following.includes(u.uid) ? (
              <Button variant="outline" onClick={() => handleUnfollow(u.uid)}>
                Dejar de seguir
              </Button>
            ) : (
              <Button variant="primary" onClick={() => handleFollow(u.uid)}>
                Seguir
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};