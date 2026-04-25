export const formatSpendingDate = (date: Date | string | number) => {
  const d = new Date(date);
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ', ' +
         d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};
