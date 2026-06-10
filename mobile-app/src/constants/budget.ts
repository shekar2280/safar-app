import { BudgetTier, BudgetOption } from "./types";

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
