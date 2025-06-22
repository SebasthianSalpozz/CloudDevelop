import type { DocumentData } from "firebase/firestore";

export interface Notification {
  id?: string;
  recipientId: string;
  senderId: string;
  postId: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export class Notification {
  static fromFirestore(id: string, data: DocumentData): Notification {
    return {
      id,
      recipientId: data.recipientId || '',
      senderId: data.senderId || '',
      postId: data.postId || '',
      message: data.message || '',
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      read: data.read || false,
    };
  }

  static toFirestore(notification: Omit<Notification, 'id'>): object {
    return {
      ...notification
    };
  }
}