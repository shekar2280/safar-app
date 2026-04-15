import { TravelerMode } from "./base";
import { GeoCoordinates, DestinationData, LocationData } from "./location";
import { TravelerGroup } from "./trip";

export interface ConcertEvent {
  id: string;
  artist: string;
  title: string;
  desc: string;
  image?: string;
  venueName?: string;
  venueAddress?: string;
  country?: string;
  countryCode?: string;
  concertDate?: string;
  concertTime?: string;
  coordinates: GeoCoordinates;
  bookingUrl?: string;
  priceRange?: any;
  status?: string;
}

export interface ConcertData {
  artist: string;
  locationInfo: DestinationData | null;
  travelers: TravelerGroup | null;
  budget: string | null;
  artistImageUrl?: string;
  locationOptions?: ConcertEvent[];
  departureInfo?: LocationData | null;
  travelerMode?: TravelerMode;
  isInternational?: boolean;
  startDate?: string;
  endDate?: string;
}
