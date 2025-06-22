import React, { useEffect, useState } from 'react';
import { Pencil, Trash } from 'react-bootstrap-icons';
import type { Post } from '../../models/Post';
import { useFirebaseUser } from '../../hooks/useFirebaseUser';
import { PostRepository } from '../../repositories/PostRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface PostListProps {
  onEdit: (post: Post) => void;
  onReload: () => void;
}

export const PostList: React.FC<PostListProps> = ({ onEdit, onReload }) => {
  const { user } = useFirebaseUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authors, setAuthors] = useState<{ [key: string]: string }>({});
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      console.log('Cargando datos para usuario:', user.uid);
      const repo = new PostRepository();
      const allPosts = await repo.getAllPosts();
      console.log('Posts cargados:', allPosts);
      const uniqueOwnerIds = [...new Set(allPosts.map((p) => p.ownerId))];
      const userRepo = new UserRepository();
      const authorNames: { [key: string]: string } = {};
      for (const ownerId of uniqueOwnerIds) {
        const profile = await userRepo.getUserProfile(ownerId);
        authorNames[ownerId] = profile?.fullName || 'Usuario desconocido';
      }
      setAuthors(authorNames);
      setPosts(allPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setIsLoading(false);
    };

    loadData();

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userProfile = docSnapshot.data();
        console.log('Datos de Firestore para following:', userProfile.following);
        setFollowing(userProfile.following || []);
      } else {
        console.warn('Documento de usuario no existe, inicializando:', user.uid);
        setDoc(doc(db, 'users', user.uid), {
          fullName: user.displayName || '',
          following: [],
        }).then(() => {
          setFollowing([]);
        }).catch((error) => {
          console.error('Error al inicializar documento:', error);
        });
      }
    }, (error) => {
      console.error('Error en onSnapshot:', error);
      setFollowing([]);
    });

    return () => unsubscribe();
  }, [user]);

  const handleFollow = async (authorId: string) => {
    if (!user) return;
    const userRepo = new UserRepository();
    await userRepo.followUser(user.uid, authorId);
  };

  const handleUnfollow = async (authorId: string) => {
    if (!user) return;
    const userRepo = new UserRepository();
    await userRepo.unfollowUser(user.uid, authorId);
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    await new PostRepository().deletePost(id);
    setPosts(posts.filter((post) => post.id !== id));
    onReload();
    setIsLoading(false);
  };

  if (isLoading) return <p>Cargando posts...</p>;
  if (!posts.length) return <p>No hay posts disponibles.</p>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card
          key={post.id}
          title={post.title}
          subtitle={`Por: ${authors[post.ownerId] || 'Cargando...'}`}
          className="break-words"
        >
          {post.imageUrl && (
            <div className="mb-3 flex justify-center">
              <img
                src={post.imageUrl}
                alt="Post"
                className="mb-3 max-h-64 rounded border"
              />
            </div>
          )}
          <p className="whitespace-pre-wrap">{post.content}</p>
          <p className="text-sm text-gray-500 mt-2">
            Creado el: {post.createdAt.toLocaleDateString()}
          </p>
          {post.ownerId !== user?.uid && (
            <Button
              variant={following.includes(post.ownerId) ? 'outline' : 'primary'}
              onClick={() =>
                following.includes(post.ownerId)
                  ? handleUnfollow(post.ownerId)
                  : handleFollow(post.ownerId)
              }
            >
              {following.includes(post.ownerId) ? 'Dejar de seguir' : 'Seguir'}
            </Button>
          )}
          {post.ownerId === user?.uid && (
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" onClick={() => onEdit(post)}>
                <Pencil className="mr-1" /> Editar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(post.id!)}
                isLoading={isLoading}
              >
                <Trash className="mr-1" /> Eliminar
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};