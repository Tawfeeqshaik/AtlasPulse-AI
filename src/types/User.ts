export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  issuesReported?: number;
  issuesVerified?: number;
  totalPoints?: number;
}
