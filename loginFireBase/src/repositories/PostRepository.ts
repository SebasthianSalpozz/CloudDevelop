import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Post } from "../models/Post";

export class PostRepository {
  private collectionName = "posts";

  private getCollectionRef() {
    return collection(db, this.collectionName);
  }

  async addPost(post: Omit<Post, "id">): Promise<Post> {
    const docRef = await addDoc(this.getCollectionRef(), Post.toFirestore(post));
    return { ...post, id: docRef.id };
  }

  async getPostsByOwnerId(ownerId: string): Promise<Post[]> {
    const q = query(this.getCollectionRef(), where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => Post.fromFirestore(doc.id, doc.data()));
  }

  async updatePost(post: Post): Promise<Post> {
    if (!post.id) throw new Error("El ID del post es requerido para actualizar");
    const postRef = doc(db, this.collectionName, post.id);
    await setDoc(postRef, Post.toFirestore(post));
    return post;
  }

  async deletePost(id: string): Promise<void> {
    const postRef = doc(db, this.collectionName, id);
    await deleteDoc(postRef);
  }
}