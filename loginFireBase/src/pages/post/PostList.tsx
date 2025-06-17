import { useEffect, useState } from "react";
import { PostRepository } from "../../repositories/PostRepository";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";
import { type Post } from "../../models/Post";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { Pencil, Trash } from "react-bootstrap-icons";

interface PostListProps {
  onEdit: (post: Post) => void;
  onReload: () => void;
}

export const PostList: React.FC<PostListProps> = ({ onEdit, onReload }) => {
  const { user } = useFirebaseUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadPosts = async () => {
      setIsLoading(true);
      const repo = new PostRepository();
      const userPosts = await repo.getPostsByOwnerId(user.uid);
      setPosts(userPosts);
      setIsLoading(false);
    };
    loadPosts();
  }, [user]);

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    await new PostRepository().deletePost(id);
    setPosts(posts.filter((post) => post.id !== id));
    onReload();
    setIsLoading(false);
  };

  if (isLoading) return <p>Cargando posts...</p>;
  if (!posts.length) return <p>No tienes posts aún.</p>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} title={post.title} className="break-words">
          <p className="whitespace-pre-wrap">{post.content}</p>
          <p className="text-sm text-gray-500 mt-2">
            Creado el: {post.createdAt.toLocaleDateString()}
          </p>
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
        </Card>
      ))}
    </div>
  );
};