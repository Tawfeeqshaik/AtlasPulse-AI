import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types/User';
import { onAuthStateChanged } from 'firebase/auth';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Listen to the user's profile document in real time
        const userRef = doc(db, 'users', user.uid);
        
        const unsubscribeProfile = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              uid: user.uid,
              displayName: data.displayName || user.displayName || 'Chennai Resident',
              email: data.email || user.email || '',
              createdAt: data.createdAt || new Date().toISOString(),
              issuesReported: data.issuesReported || data.reportsSubmitted || 0,
              issuesVerified: data.issuesVerified || 0,
              totalPoints: data.totalPoints || 0,
            } as UserProfile);
          } else {
            // Document doesn't exist, create it!
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || 'Chennai Resident',
              email: user.email || '',
              createdAt: new Date().toISOString(),
              issuesReported: 0,
              issuesVerified: 0,
              totalPoints: 0,
            };
            try {
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);
            } catch (err) {
              console.error('Failed to create user profile document:', err);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error('User profile subscription error:', error);
          setLoading(false);
        });

        return () => {
          unsubscribeProfile();
        };
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  return { userProfile, loading };
}
