import { AlertType, TripType } from "./base";
import { UserTrip } from "./trip";

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

export interface ActionButtonProps {
  title: string | React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  styleOverride?: object;
}

export interface ActiveTripCardProps {
  trip: UserTrip & { totalBudget?: number };
}

export interface DestinationPickerProps {
  onLocationSelect: (location: any | null) => void; // Using any to avoid circularity if needed, but should be DestinationData
  placeholder?: string;
}

export interface LocationPickerProps {
  onLocationChange: (location: any | null) => void; // Should be LocationData
  placeholder?: string;
  title?: string;
}

export interface HotelInfoProps {
  hotelData?: any[]; // Should be HotelOption[]
  cityName?: string;
}

export interface HotelTypeToggleProps {
  selectedType: TripType;
  onSelectType: (type: TripType) => void;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  icon?: any;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  type?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
}

export interface LocationStatusProps {
  effectiveLocation: any;
  isFinished: boolean;
  isDark: boolean;
  onRefresh: () => void;
}

export type VisibilityState = "full" | "teaser" | "locked";

export interface JourneyItemProps {
  item: any;
  index: number;
  isCompleted?: boolean;
  isFinished: boolean;
  isDark: boolean;
  colors: any;
  sections: any;
  processingIndex: number | null;
  visibilityState?: VisibilityState;
  onMarkAsDone: (item: any) => void;
  onSkip?: (item: any) => void;
  onOpenNavigation: (placeName: string) => void;
  onFindFood: (placeName: string) => void;
}

export interface WeatherWidgetProps {
  cityName: string;
}

export interface PlannedTripProps {
  itineraryDetails?: any;
  cityName: string;
  isActive: boolean;
  isFinished?: boolean;
  onActivate: () => void;
  onNavigateToActive: () => void;
  visitedIndices?: number[];
  skippedIndices?: number[];
  onToggleVisited?: (index: number) => void;
}

export interface RestaurantsInfoProps {
  restaurantsInfo?: {
    restaurants?: any[];
    localExperiences?: any[];
  } | null;
  cityName: string;
}
