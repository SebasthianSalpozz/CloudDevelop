import { useState } from "react";
import { Container } from "../../components/Container";
import Menu from "../../components/Menu";
import Button from "../../components/Button";
import { PostList } from "./PostList";
import { PostModal } from "../../components/PostModal";
import { PostRepository } from "../../repositories/PostRepository";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";
import { type Post } from "../../models/Post";

const PostsPage = () => {
  const { user } = useFirebaseUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleSavePost = async (post: Omit<Post, "id"> | Post) => {
    if (!user) return;
    const repo = new PostRepository();
    if ("id" in post) {
      await repo.updatePost(post as Post);
    } else {
      await repo.addPost({ ...post, ownerId: user.uid });
    }
    setReloadKey((prev) => prev + 1);
  };

  const handleEdit = (post: Post) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  return (
    <>
      <Menu />
      <Container className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis Posts</h1>
          <Button
            variant="primary"
            onClick={() => {
              setPostToEdit(null);
              setIsModalOpen(true);
            }}
          >
            Crear Post
          </Button>
        </div>
        <PostList onEdit={handleEdit} onReload={() => setReloadKey((prev) => prev + 1)} key={reloadKey} />
      </Container>
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePost}
        postToEdit={postToEdit}
      />
    </>
  );
};

export default PostsPage;