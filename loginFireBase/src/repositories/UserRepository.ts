import { collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export interface UserProfile {
  uid: string;
  fullName: string;
  following: string[];
  createdAt: any;
}

export class UserRepository {
  private collectionName = 'users';

  private getCollectionRef() {
    return collection(db, this.collectionName);
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, this.collectionName, uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return null;
    return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
  }
    
  async followUser(followerId: string, followedId: string): Promise<void> {
    const userRef = doc(db, this.collectionName, followerId);
    const userDoc = await getDoc(userRef);
    let following = [];

    if (userDoc.exists()) {
        following = userDoc.data().following || [];
    } else {
        await setDoc(userRef, { following: [] });
    }

    if (!following.includes(followedId)) {
        following.push(followedId);
        await setDoc(userRef, { following }, { merge: true });
    }
  }

  async unfollowUser(followerId: string, followedId: string): Promise<void> {
    const userRef = doc(db, this.collectionName, followerId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const following = (userDoc.data().following || []).filter((id: string) => id !== followedId);
        await setDoc(userRef, { following }, { merge: true });
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const snapshot = await getDocs(this.getCollectionRef());
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  }
}