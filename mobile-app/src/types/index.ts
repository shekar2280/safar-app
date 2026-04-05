export enum TravelerMode {
  Solo = "SOLO",
  Couple = "COUPLE",
  Family = "FAMILY",
  Friends = "FRIENDS",
}

export enum BudgetTier {
  Cheap = "Cheap",
  Moderate = "Moderate",
  Luxury = "Luxury",
}

export enum TripCategory {
  TRENDING = "TRENDING",
  HIDDEN = "HIDDEN",
  FESTIVE = "FESTIVE",
  CONCERT = "CONCERT",
  GENERAL = "GENERAL",
}

export type PaymentMethod = "card" | "wallet";
export type AuthMode = "login" | "register";
export type TimeSlot = "Morning" | "Afternoon" | "Evening";
export type AlertType = "error" | "confirm" | "info";
