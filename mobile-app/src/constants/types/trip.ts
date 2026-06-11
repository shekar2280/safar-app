import { TravelerMode, TripCategory, TripType } from "./base";
import { DestinationData, LocationData } from "./location";
import { TripPlan } from "./itinerary";

export interface Spending {
  id: string;
  name: string;
  amount: number;
  timestamp: number;
  date: string;
  isLocal?: boolean;
}

export interface TravelerGroup {
  id: number;
  title: string;
  desc: string;
  people: string;
}
export interface BudgetOption {
  id: number;
  title: string;
  desc: string;
  icon: string;
}

export interface TripData {
  departureInfo: LocationData | null;
  destinationInfo: DestinationData | null;
  travelerMode: TravelerMode;
  isInternational: boolean;
  totalDays: number;
  traveler: TravelerGroup | null;
  budget: string | null;
  tripCategory?: TripCategory;
  metaInfo?: string;
}

export interface UserTrip {
  id: string;
  savedTripId?: string;
  userEmail: string;
  userId: string;
  totalDays: number;
  traveler: TravelerGroup;
  isInternational: boolean;
  departureIata: string;
  destinationIata?: string;
  travelerMode?: string;
  isActive: boolean;
  isFinished: boolean;
  activatedAt?: string;
  completedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  tripPlan?: TripPlan;
  totalBudget: number;
  visitedIndices: number[];
  skipped_indices?: number[];
  archivedSpendings?: Spending[];
  concertData?: any;
  imageUrl?: string[] | string;
  savedTrip?: {
    id: string;
    normalized_key: string;
    trip_plan: any;
    image_urls: string[];
    destination_iata?: string;
  };
}

export interface ActiveTripData {
  id: string;
  completedPlaceIds?: string[];
  visitedIndices?: number[];
  skipped_indices?: number[];
  totalBudget?: number;
  archivedSpendings?: Spending[];
  tripPlan?: TripPlan;
  imageUrl?: string | string[];
  isActive?: boolean;
  isFinished?: boolean;
}

export interface CommonTripDetails {
  tripType: TripType | null;
  travelerMode: TravelerMode | null;
  departureInfo: LocationData | null;
  destinationInfo: DestinationData | null;
  traveler: TravelerGroup | null;
  budget: string | null;
  startDate: string | null;
  endDate: string | null;
  totalDays: number | null;
  tripCategory: TripCategory | null;
  trendingPlaces: unknown[];
  isInternational: boolean;
}
