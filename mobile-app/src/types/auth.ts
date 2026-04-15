import { LocationData } from "./location";

export interface UserProfile {
  fullName: string;
  email: string;
  uid: string;
  photoURL?: string;
  homeLocation?: LocationData | null;
}

export interface SafarUser {
  id: number;
  firebase_uid: string;
  email: string | null;
  full_name: string | null;
  photo_url: string | null;
  created_at: string;
  last_login: string | null;
}
