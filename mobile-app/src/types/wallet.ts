export interface SpendingFormProps {
  spendingName: string;
  amountInput: string;
  isSaving: boolean;
  setSpendingName: (name: string) => void;
  setAmountInput: (amount: string) => void;
  hideForm: () => void;
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
