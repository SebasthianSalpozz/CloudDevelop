import { type DocumentData } from "firebase/firestore";

export interface Post {
  id?: string;
  title: string;
  content: string;
  createdAt: Date;
  ownerId: string;
}

export class Post {
  static fromFirestore(id: string, data: DocumentData): Post {
    return {
      id,
      title: data.title || "",
      content: data.content || "",
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      ownerId: data.ownerId || "",
    };
  }

  static toFirestore(post: Omit<Post, "id">): object {
    return {
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      ownerId: post.ownerId,
    };
  }
}