import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Post } from '../models/Post';
import { UserRepository } from './UserRepository';
import { NotificationRepository } from './NotificationRepository';
import { Notification } from '../models/Notification';

export class PostRepository {
  private collectionName = 'posts';

  private getCollectionRef() {
    return collection(db, this.collectionName);
  }

  async addPost(post: Omit<Post, 'id'>): Promise<Post> {
    const docRef = await addDoc(this.getCollectionRef(), Post.toFirestore(post));
    const newPost = { ...post, id: docRef.id };
    await this.notifyFollowers(newPost);
    return newPost;
  }

  async getPostsByOwnerId(ownerId: string): Promise<Post[]> {
    const q = query(this.getCollectionRef(), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => Post.fromFirestore(doc.id, doc.data()));
  }

  async getPostsByFollowing(userId: string): Promise<Post[]> {
    const userRepo = new UserRepository();
    const userProfile = await userRepo.getUserProfile(userId);
    if (!userProfile || !userProfile.following.length) return [];
    const q = query(this.getCollectionRef(), where('ownerId', 'in', userProfile.following));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => Post.fromFirestore(doc.id, doc.data()));
  }

  async getAllPosts(): Promise<Post[]> {
    const snapshot = await getDocs(this.getCollectionRef());
    return snapshot.docs.map((doc) => Post.fromFirestore(doc.id, doc.data()));
  }

  async updatePost(post: Post): Promise<Post> {
    if (!post.id) throw new Error('El ID del post es requerido');
    const postRef = doc(db, this.collectionName, post.id);
    await setDoc(postRef, Post.toFirestore(post));
    return post;
  }

  async deletePost(id: string): Promise<void> {
    const postRef = doc(db, this.collectionName, id);
    await deleteDoc(postRef);
  }

  private async notifyFollowers(post: Post): Promise<void> {
    const userRepo = new UserRepository();
    const authorProfile = await userRepo.getUserProfile(post.ownerId);
    if (!authorProfile) return;
    const allUsers = await userRepo.getAllUsers();
    const followers = allUsers
      .filter(u => u.following?.includes(post.ownerId))
      .map(u => u.uid);
    if (followers.length === 0) return;
    const notificationRepo = new NotificationRepository();
    const authorName = authorProfile.fullName || 'Alguien';
    for (const followerId of followers) {
      const notification: Omit<Notification, 'id'> = {
        recipientId: followerId,
        senderId: post.ownerId,
        postId: post.id!,
        message: `${authorName} ha publicado un nuevo post: "${post.title}"`,
        createdAt: new Date(),
        read: false,
      };
      await notificationRepo.addNotification(notification);
    }
  }
}
