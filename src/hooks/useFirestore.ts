import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  getDocs,
  getDoc,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { Issue } from '../types/Issue';
import { seedDemoData } from '../lib/seedData';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useFirestore() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [localIssues, setLocalIssues] = useState<Issue[]>(() => {
    try {
      const stored = localStorage.getItem('atlaspulse_local_issues');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse local issues:', e);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Seed database if empty, then listen to realtime updates
    const initAndSubscribe = async () => {
      try {
        await seedDemoData();
      } catch (err) {
        console.error("Auto seeding check failed", err);
      }

      setLoading(true);
      const path = 'issues';
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const items: Issue[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            let createdAtStr = new Date().toISOString();
            if (data.createdAt) {
              if (typeof data.createdAt.toDate === 'function') {
                createdAtStr = data.createdAt.toDate().toISOString();
              } else if (typeof data.createdAt === 'string') {
                createdAtStr = data.createdAt;
              } else if (data.createdAt.seconds) {
                createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
              }
            }
            items.push({ 
              id: doc.id, 
              ...data,
              createdAt: createdAtStr
            } as Issue);
          });
          setIssues(items);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore subscription error:', err);
          setError(err.message);
          setLoading(false);
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );

      return unsubscribe;
    };

    let unsubPromise = initAndSubscribe();

    return () => {
      unsubPromise.then((unsub) => unsub && unsub());
    };
  }, []);

  const addIssue = async (issue: Omit<Issue, 'id'>) => {
    const path = 'issues';
    
    // Create a local-first copy of the issue with a simulated Firestore id
    const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLocalIssue: Issue = {
      ...issue,
      id: localId,
      createdBy: issue.createdBy || auth.currentUser?.uid || 'anonymous',
      createdByName: issue.createdByName || auth.currentUser?.displayName || 'Chennai Resident'
    };

    // Save immediately to local state and localStorage
    setLocalIssues(prev => {
      const updated = [newLocalIssue, ...prev];
      try {
        localStorage.setItem('atlaspulse_local_issues', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save issue to localStorage:', e);
      }
      return updated;
    });

    try {
      // Create a promise that rejects after 2.5 seconds (timeout)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 2500);
      });

      // Try to add to Firestore within the timeout window
      const addPromise = addDoc(collection(db, path), {
        ...issue,
        createdBy: issue.createdBy || auth.currentUser?.uid || 'anonymous',
        createdByName: issue.createdByName || auth.currentUser?.displayName || 'Chennai Resident'
      });

      const docRef = await Promise.race([addPromise, timeoutPromise]);
      console.log('Successfully saved issue to Firestore:', docRef.id);
      
      // Award points to report author if they are a real user and not a seed/anonymous
      const authorId = issue.createdBy || auth.currentUser?.uid;
      if (authorId && authorId !== 'seed' && authorId !== 'anonymous') {
        try {
          const userRef = doc(db, 'users', authorId);
          await updateDoc(userRef, {
            issuesReported: increment(1),
            totalPoints: increment(25)
          });
          console.log(`Awarded 25 reporting points to user ${authorId}`);
        } catch (userErr) {
          console.error('Failed to award reporting points:', userErr);
        }
      }

      // Update local issue with real Firestore ID to keep them in sync
      setLocalIssues(prev => {
        const updated = prev.map(item => {
          if (item.id === localId) {
            return { ...item, id: docRef.id };
          }
          return item;
        });
        try {
          localStorage.setItem('atlaspulse_local_issues', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save updated local issues list:', e);
        }
        return updated;
      });

      return docRef.id;
    } catch (err: any) {
      if (err.message === 'TIMEOUT') {
        console.warn('Firestore addDoc timed out. Keeping issue in local-first storage.');
        return localId;
      }
      console.error('Error adding issue to Firestore, falling back to local-first storage:', err);
      return localId;
    }
  };

  const updateIssueStatus = async (docId: string, status: 'Open' | 'In Progress' | 'Resolved') => {
    // 1. Update in local storage first
    setLocalIssues(prev => {
      const updated = prev.map(issue => {
        if (issue.id === docId || issue.issueId === docId) {
          return { ...issue, status };
        }
        return issue;
      });
      try {
        localStorage.setItem('atlaspulse_local_issues', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save updated status to localStorage:', e);
      }
      return updated;
    });

    // 2. Update local state copy of live list in case realtime sync is slow
    setIssues(prev => prev.map(issue => {
      if (issue.id === docId || issue.issueId === docId) {
        return { ...issue, status };
      }
      return issue;
    }));

    // 3. If it is not a local ID, try to update in Firestore
    if (!docId.startsWith('local-')) {
      const path = `issues/${docId}`;
      try {
        const docRef = doc(db, 'issues', docId);
        
        // Award points if status is being updated to Resolved
        if (status === 'Resolved') {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const currentData = docSnap.data();
            if (currentData.status !== 'Resolved') {
              const creatorId = currentData.createdBy || currentData.userId;
              if (creatorId && creatorId !== 'seed' && creatorId !== 'anonymous') {
                const creatorRef = doc(db, 'users', creatorId);
                await updateDoc(creatorRef, {
                  totalPoints: increment(50)
                });
                console.log(`Awarded 50 resolution points to user ${creatorId}`);
              }
            }
          }
        }

        await updateDoc(docRef, { status });
      } catch (err: any) {
        console.error('Error updating issue status in Firestore:', err);
      }
    }
  };

  const verifyIssue = async (issueId: string, userId: string): Promise<void> => {
    // 1. Update in local storage/state first
    setLocalIssues(prev => {
      const updated = prev.map(issue => {
        if (issue.id === issueId || issue.issueId === issueId) {
          const verifiedBy = issue.verifiedBy || [];
          if (!verifiedBy.includes(userId)) {
            return {
              ...issue,
              verificationCount: (issue.verificationCount || 0) + 1,
              verifiedBy: [...verifiedBy, userId]
            };
          }
        }
        return issue;
      });
      try {
        localStorage.setItem('atlaspulse_local_issues', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save verified local issues:', e);
      }
      return updated;
    });

    // Also update in live list state
    setIssues(prev => {
      return prev.map(issue => {
        if (issue.id === issueId || issue.issueId === issueId) {
          const verifiedBy = issue.verifiedBy || [];
          if (!verifiedBy.includes(userId)) {
            return {
              ...issue,
              verificationCount: (issue.verificationCount || 0) + 1,
              verifiedBy: [...verifiedBy, userId]
            };
          }
        }
        return issue;
      });
    });

    // 2. If it is not a local ID, try to update in Firestore
    if (!issueId.startsWith('local-')) {
      const path = `issues/${issueId}`;
      try {
        const issueRef = doc(db, 'issues', issueId);
        const issueSnap = await getDoc(issueRef);
        const data = issueSnap.data();
        
        // Prevent duplicate verification or verification of own issue
        if (data?.verifiedBy?.includes(userId)) return;
        if (data?.createdBy === userId || data?.userId === userId) return;
        
        await updateDoc(issueRef, {
          verificationCount: increment(1),
          verifiedBy: arrayUnion(userId)
        });
        
        // Award points to verifier
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          issuesVerified: increment(1),
          totalPoints: increment(10)
        });

        // Award points to creator if not seed/anonymous
        const creatorId = data?.createdBy || data?.userId;
        if (creatorId && creatorId !== 'seed' && creatorId !== 'anonymous' && creatorId !== userId) {
          const creatorRef = doc(db, 'users', creatorId);
          await updateDoc(creatorRef, {
            totalPoints: increment(5)
          });
        }
      } catch (err: any) {
        console.error('Error in verifyIssue Firestore operation:', err);
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const refresh = async () => {
    const path = 'issues';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: Issue[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let createdAtStr = new Date().toISOString();
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          } else if (data.createdAt.seconds) {
            createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
          }
        }
        items.push({ 
          id: doc.id, 
          ...data,
          createdAt: createdAtStr
        } as Issue);
      });
      setIssues(items);
    } catch (err: any) {
      console.error('Manual refresh of Firestore failed:', err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  };

  // Combine issues, prioritizing Firestore items if there are duplicates (by issueId)
  const combinedIssues = [...issues];
  localIssues.forEach((local) => {
    if (!combinedIssues.some((f) => f.issueId === local.issueId)) {
      combinedIssues.push(local);
    }
  });

  return {
    issues: combinedIssues,
    loading,
    error,
    addIssue,
    updateIssueStatus,
    verifyIssue,
    refresh
  };
}

