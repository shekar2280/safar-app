export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  name: string;
  label: string;
  fullAddress: string;
  country: string;
  countryCode: string;
  coordinates: {
    lat?: number;
    lon?: number;
    latitude?: number;
    longitude?: number;
  };
  iataCode?: string;
  isLiveGPS?: boolean;
}

export interface DestinationData {
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  coordinates: { lat: number; lon: number };
  title?: string;
  festival?: string;
  imageUrl?: string;
  bookingUrl?: string;
  venueName?: string;
  venueAddress?: string;
  concertDate?: string;
  concertTime?: string;
  priceRange?: any;
  eventId?: string;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  addresstype?: string;
  type?: string;
  category?: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state_district?: string;
    state?: string;
    country?: string;
    country_code?: string;
    municipality?: string;
    suburb?: string;
  };
}

export interface TrendingLocationData {
  name: string;
  city: string;
  state: string;
  country: string;
  normalizedKey: string;
  label: string;
  fullAddress: string;
  coordinates: { lat: number | string; lon: number | string };
  insight?: string;
  recommendedMonth?: string;
}

export interface TrendingPlace {
  id: number;
  name: string;
  title: string;
  country: string;
  desc: string;
  image: string;
  famous_landmark: string;
  insight?: string;
  recommended_month?: string;
}
