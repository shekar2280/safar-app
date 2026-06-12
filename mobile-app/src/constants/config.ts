import { BudgetTier, BudgetOption } from "./types";

export const ACTIVE_TRIP_CACHE_KEY = "@SAFAR_ACTIVE_TRIP_CACHE";
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const MAX_TRIP_DAYS = 5;

export const SelectBudgetOptions: BudgetOption[] = [
  {
    id: 1,
    title: BudgetTier.Cheap,
    desc: "Budget-friendly choices",
    icon: "🪙",
  },
  {
    id: 2,
    title: BudgetTier.Moderate,
    desc: "Balanced spending",
    icon: "💰",
  },
  {
    id: 3,
    title: BudgetTier.Luxury,
    desc: "Premium picks",
    icon: "💎",
  },
];
