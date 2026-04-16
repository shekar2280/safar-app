import { NormalizedTripPlan } from "@/src/types";

export const normalizeItinerary = (data: Record<string, any>): any => {
  const normalized: any = { ...data };

  if (!normalized.recommendations) {
    normalized.recommendations = {};
  }

  const restaurants = data.restaurants || data.restaurantList || data.restaurant_list;
  if (restaurants && !normalized.recommendations.restaurants) {
    normalized.recommendations.restaurants = restaurants;
  }
  
  const experiences = data.localExperiences || data.local_experiences || data.experienceList;
  if (experiences && !normalized.recommendations.localExperiences) {
    normalized.recommendations.localExperiences = experiences;
  }

  const hotels = data.hotelOptions || data.hotels || data.hotel_options || data.hotelList;
  if (hotels && !normalized.hotelOptions) {
    normalized.hotelOptions = hotels;
  }

  let days: any[] = normalized.dailyItinerary || data.itinerary || [];
  if (!Array.isArray(days)) days = [];

  if (days.length === 0) {
    for (const key in data) {
      const match = key.match(/^day(\d+)$/i);
      if (match) {
        const dayContent = data[key];
        const dayPlaces = Array.isArray(dayContent) ? dayContent : 
                         (dayContent.places ? dayContent.places : [dayContent]);
        days.push(...dayPlaces);
      }
    }
    if (days.length > 0) {
      normalized.dailyItinerary = days;
    }
  }

  return normalized;
};
