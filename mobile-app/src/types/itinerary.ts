import { GeoCoordinates } from "./location";
import { TimeSlot } from "./base";

export interface HotelOption {
  hotelName: string;
  hotelAddress: string;
  pricePerNight: number;
  hotelImageURL?: string;
  geoCoordinates?: GeoCoordinates;
  rating: number;
  description: string;
  suitabilityReason: string;
}

export interface PlaceItem {
  placeName: string;
  placeDetails: string;
  geoCoordinates: GeoCoordinates;
  ticketPricing: string;
  estimatedTravelTime: string;
  bestTimeToVisit: string;
  timeSlot: TimeSlot;
  vibe?: string;
  searchKeyword?: string;
}

export interface Restaurant {
  restaurantName: string;
  description: string;
  priceRange: string;
  address?: string;
  approximateCost?: string;
  geoCoordinates: GeoCoordinates;
  recommendedDishes?: string[];
}

export interface LocalExperience {
  experienceName: string;
  description: string;
  ticketPricing?: string | number;
  address?: string;
  geoCoordinates?: GeoCoordinates;
  vibe?: string;
}

export interface TripPlan {
  tripName: string;
  tripDuration?: string;
  departureIata?: string;
  destinationIata?: string;
  hotelOptions: HotelOption[];
  dailyItinerary: PlaceItem[];
  recommendations: {
    restaurants: Restaurant[];
    localExperiences: LocalExperience[];
  };
  imageUrl?: string | string[];
  bestTransport?: string;
  weatherInsight?: string;
}

export interface NormalizedTripPlan extends Omit<TripPlan, "dailyItinerary"> {
  days: Record<string, unknown>;
}

export interface SightItem extends PlaceItem {
  isLocation: boolean;
  isDone: boolean;
  isSkipped?: boolean;
  distance: number | null;
  originalIndex: number;
}

export interface ExperienceItem extends LocalExperience {
  isDone: boolean;
  isSkipped?: boolean;
  placeName: string;
  isLocation: boolean;
}

export interface JourneyItem extends SightItem {
  activity: ExperienceItem | null;
}
