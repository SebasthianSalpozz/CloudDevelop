import { collection, getDocs, query, where, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Notification } from '../models/Notification';

export class NotificationRepository {
  private collectionName = 'notifications';

  private getCollectionRef() {
    return collection(db, this.collectionName);
  }

  async getNotificationsByRecipientId(recipientId: string): Promise<Notification[]> {
    const q = query(this.getCollectionRef(), where('recipientId', '==', recipientId));
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map((doc) => Notification.fromFirestore(doc.id, doc.data()));
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string): Promise<void> {
    const notificationRef = doc(db, this.collectionName, id);
    await setDoc(notificationRef, { read: true }, { merge: true });
  }

  async addNotification(notification: Omit<Notification, 'id'>): Promise<void> {
    await addDoc(this.getCollectionRef(), Notification.toFirestore(notification));
  }
}