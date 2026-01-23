export const normalizeItinerary = (data) => {
  const days = {};
  const rest = {};

  for (const key in data) {
    const match = key.match(/^day(\d+)$/i);
    if (match) {
      days[match[1]] = data[key]; // "1": {...}
    } else {
      rest[key] = data[key];
    }
  }

  return {
    ...rest,
    days, // structured by day number
  };
};
