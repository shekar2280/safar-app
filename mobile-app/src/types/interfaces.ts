import {
  TravelerMode,
  BudgetTier,
  TripCategory,
  TimeSlot,
  AlertType,
} from "./index";
export { TravelerMode, BudgetTier, TripCategory, TimeSlot, AlertType };

export interface GeoCoordinates {
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

export interface TravelerGroup {
  id: number;
  title: string;
  desc: string;
  people: string;
}

export interface BudgetOption {
  id: number;
  title: BudgetTier;
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

export interface CreateTripContextValue {
  tripData: Partial<TripData>;
  setTripData: (data: Partial<TripData>) => void;
}

export interface UserProfile {
  fullName: string;
  email: string;
  uid: string;
  photoURL?: string;
  homeLocation?: LocationData | null;
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
  archivedSpendings?: any[];
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

export interface HotelOption {
  hotelName: string;
  hotelAddress: string;
  pricePerNight: number;
  hotelImageURL: string;
  geoCoordinates: GeoCoordinates;
  rating: number;
  description: string;
  suitabilityReason?: string;
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
  priceRange: string;
  approximateCost?: string;
  geoCoordinates?: GeoCoordinates;
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

export interface ConcertTripContextValue {
  concertData: ConcertData;
  setConcertData: (data: ConcertData) => void;
}

export interface CommonTripDetails {
  travelerMode: TravelerMode | null;
  departureInfo: LocationData | null;
  destinationInfo: DestinationData | null;
  traveler: TravelerGroup | null;
  budget: string | null;
  totalDays: number | null;
  tripCategory: TripCategory | null;
  trendingPlaces: unknown[];
  isInternational: boolean;
}

export interface CommonTripContextValue {
  tripDetails: CommonTripDetails;
  setTripDetails: (data: Partial<CommonTripDetails>) => void;
  resetTripDetails: () => void;
}

export interface ActiveTripData {
  id: string;
  completedPlaceIds?: string[];
  visitedIndices?: number[];
  tripPlan?: TripPlan;
  imageUrl?: string | string[];
  isActive?: boolean;
  isFinished?: boolean;
}

export interface ActiveTripContextValue {
  activeTrip: ActiveTripData | null;
  setActiveTrip: (trip: ActiveTripData | null) => void;
  clearActiveTrip: () => void;
  lastRefreshed: Date | null;
  setLastRefreshed: (date: Date | null) => void;
  markAsDone: (
    placeId: string,
    userId: string,
    tripId: string,
    index?: number,
  ) => Promise<void>;
}

export interface LocationContextValue {
  currentLocation: LocationData | null;
  updateLocation: (locationData: LocationData | null) => Promise<void>;
  refreshGPS: () => Promise<LocationData>;
  loading: boolean;
}

export interface UserContextValue {
  userProfile: UserProfile | null;
  setUserProfile: (
    profile:
      | UserProfile
      | null
      | ((prev: UserProfile | null) => UserProfile | null),
  ) => void;
  userTrips: UserTrip[];
  setUserTrips: (
    trips: UserTrip[] | ((prev: UserTrip[]) => UserTrip[]),
  ) => void;
  loading: boolean;
  transactions: unknown[];
  setTransactions: (
    transactions: unknown[] | ((prev: unknown[]) => unknown[]),
  ) => void;
  refreshTrips: () => Promise<void>;
}

export interface SafarAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface AIDisclaimerProps {
  style?: object;
}

export interface UserTripCardProps {
  trip: UserTrip;
  onDelete?: (id: string) => void;
}

export interface UserTripListProps {
  userTrips: UserTrip[];
  onDelete?: (id: string) => void;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
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
export interface TravelOption {
  id: number;
  title: string;
  name?: string;
  desc?: string;
  festival?: string;
  Highlights?: string;
  Experience?: string;
  icon?: string;
  image?: string | any;
  tripCategory?: string;
  auspiciousDay?: string;
  recommendedMonth?: string;
  insight?: string;
}

export interface DiscoverCardProps {
  option: TravelOption;
  selectedOption?: TravelOption | null;
  cardHeight?: number;
  hideTag?: boolean;
}

export interface TrendingTripsCardProps {
  option: TravelOption;
  selectedOption?: TravelOption | null;
  cardHeight?: number;
}

export interface OptionCardProps {
  option: TravelOption;
  selectedOption?: TravelOption | null;
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

export interface ActionButtonProps {
  title: string | React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  styleOverride?: object;
}
export interface ActiveTripCardProps {
  trip: UserTrip & { totalBudget?: number };
}
export interface SpendingFormProps {
  spendingName: string;
  amountInput: string;
  image: string | null;
  extractedText: string;
  isProcessing: boolean;
  setSpendingName: (name: string) => void;
  setAmountInput: (amount: string) => void;
  hideForm: () => void;
  pickImage: (source: "camera" | "gallery") => () => void;
  clearAll: () => void;
  recordSpending: () => void;
}

export interface SpendingItemProps {
  item: {
    id: string;
    name: string;
    amount: number | string;
    category?: string;
    date: any;
  };
  tripId: string;
  isFinished?: boolean;
}

export interface DestinationPickerProps {
  onLocationSelect: (location: DestinationData | null) => void;
  placeholder?: string;
}

export interface LocationPickerProps {
  onLocationChange: (location: LocationData | null) => void;
  placeholder?: string;
  title?: string;
}

export interface HotelInfoProps {
  hotelData?: HotelOption[];
  cityName?: string;
}
