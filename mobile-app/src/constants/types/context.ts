import { TravelerMode, TripCategory, PaymentMethod, AuthMode } from "./base";
import { TripData, CommonTripDetails, ActiveTripData } from "./trip";
import { ConcertData } from "./concert";
import { LocationData } from "./location";
import { UserProfile } from "./auth";

export interface CreateTripContextValue {
  tripData: Partial<TripData>;
  setTripData: (data: Partial<TripData>) => void;
}

export interface ConcertTripContextValue {
  concertData: ConcertData;
  setConcertData: (data: ConcertData) => void;
}

export interface CommonTripContextValue {
  tripDetails: CommonTripDetails;
  setTripDetails: (data: Partial<CommonTripDetails>) => void;
  resetTripDetails: () => void;
}

export interface ActiveTripContextValue {
  activeTrip: ActiveTripData | null;
  setActiveTrip: (trip: ActiveTripData | null) => void;
  clearActiveTrip: () => void;
  lastRefreshed: Date | null;
  setLastRefreshed: (date: Date | null) => void;
  markAsDone: (tripId: string, visitedIndices: number[]) => Promise<void>;
  skipPlace: (tripId: string, skippedIndices: number[]) => Promise<void>;
  toggleVisited: (tripId: string, index: number) => Promise<void>;
  toggleSkipped: (tripId: string, index: number) => Promise<void>;
  updateTripBudget: (tripId: string, totalBudget: number) => Promise<void>;
  recordSpending: (tripId: string, spending: { name: string, amount: number }) => Promise<void>;
  removeSpending: (tripId: string, spendingId: string) => Promise<void>;
  deactivateTrip: (tripId: string) => Promise<void>;
  finalizeTrip: (tripId: string) => Promise<void>;
}

export interface LocationContextValue {
  currentLocation: LocationData | null;
  updateLocation: (locationData: LocationData | null) => Promise<void>;
  refreshGPS: () => Promise<LocationData | null>;
  loading: boolean;
  gpsEnabled: boolean;
}

export interface UserContextValue {
  userProfile: UserProfile | null;
  setUserProfile: (
    profile:
      | UserProfile
      | null
      | ((prev: UserProfile | null) => UserProfile | null),
  ) => void;
  loading: boolean;
  transactions: unknown[];
  setTransactions: (
    transactions: unknown[] | ((prev: unknown[]) => unknown[]),
  ) => void;
}
