export const AI_PROMPT = `
Generate a premium, curated trip plan for a {travelerMode} trip to {location} for {totalDays} days and {totalNight} nights. The traveler group identity is {traveler} and the budget is {budget}.

### DURATION AUTO-CORRECTION:
Evaluate if the destination '{location}' is a specific local attraction, a single monument/landmark, or a small neighborhood/day-trip spot (e.g. "Elephanta Caves", "Colaba", "Bandra West") rather than a full city/region. If the requested duration of {totalDays} days is excessive to enjoy there, you MUST auto-correct the itinerary duration to a realistic length (e.g., 1 day for Elephanta Caves) and generate a shorter itinerary matching that corrected duration.
If you scale down/adjust the duration, set "adjustedDuration" to the new number of days (e.g., 1) and provide a professional, friendly explanation in the top-level "adjustedDurationReason" string (e.g., "We noticed Elephanta Caves is best enjoyed as a 1-day trip! We've optimized your itinerary for the perfect day out."). If no auto-correction is needed, set "adjustedDuration" to {totalDays} and "adjustedDurationReason" to null.

### HOTEL SELECTION (HYBRID RULE):
If you have auto-corrected the trip to be a 1-day/day-trip excursion, or if {location} is a landmark/monument that does not have or require overnight stays/hotels, set "hotelOptions" to an empty array [] in your JSON output. Otherwise, list 5-6 hotel options.

### CURATION PHILOSOPHY:
You are a high-end luxury travel concierge. 
- FOCUS: Experience-first. purge all logistical chores (check-in/out, travel to/from airport).
- DINING: Only include a specific, named high-vibe restaurant or local signature dish experience.
- PERSONALIZATION based on {travelerMode}:
  - SOLO: Focus on social vibes, safety, and personal growth.
  - COUPLE: Focus on romance, privacy, and aesthetic "date" spots.
  - FAMILY: Focus on kid-friendly logistics, diverse age appeal, and ease of transport.
  - FRIENDS: Focus on high energy, group-friendly dining, and unique social experiences.

### STRICT EXCLUSIONS:
- NO "Hotel Check-in", "Hotel Check-out" or "Baggage Claim".
- NO generic "Lunch" or "Dinner".
- NO "Free time" or "Rest at hotel".
- Every item MUST be a specific, named destination, landmark, or activity.

### INSTRUCTIONS:

1. Transport, Weather & Duration (REQUIRED):
   At the top level, include:
   - "departureIata": "3-letter origin code"
   - "destinationIata": "3-letter destination code"
   - "bestTransport": "Specific advice on the best way to move around this city (e.g., specific MRT lines vs taxis)."
   - "weatherInsight": "Short packing/weather tip for the current month."
   - "adjustedDuration": number (the final duration in days, either the requested {totalDays} or the adjusted shorter number of days).
   - "adjustedDurationReason": string or null (if duration was corrected, explain why; otherwise null).

2. Hotel options (5-6):
   - Include: hotelName, hotelAddress, pricePerNight (in ₹), rating (0–5), description, suitabilityReason, and geoCoordinates {"latitude": number, "longitude": number}. (Set to empty array [] if it is a day-trip or hotel stays are not needed).

3. Daily itinerary (Pool Logic):
   - Include exactly {totalPlaces} "places" objects in "dailyItinerary" (unless you scaled down the trip duration, in which case generate exactly adjustedDuration * 4 places, i.e., 4 places per day).
   - Each MUST include: placeName, placeDetails, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, timeSlot ("Morning", "Afternoon", "Evening"), geoCoordinates {"latitude": number, "longitude": number}, vibe, and searchKeyword.

4. Recommendations:
   - Use the key "recommendations".
   - "restaurants": Exactly {totalRecs} options. Include: restaurantName, description, priceRange (one of: Cheap, Moderate, Luxury), address, approximateCost, geoCoordinates, and recommendedDishes (Array).
   - "localExperiences": Exactly {totalRecs} unique things to do. Include: experienceName, description, ticketPricing, address, geoCoordinates, and vibe.

5. Metadata:
   - "tripName": "City, CountryCode" (e.g., "Paris, FRA").
   - "tripDuration": "X days, Y nights" where X is the final duration in days and Y is X-1 nights.

### JSON SYNTAX RULES (STRICT):
- CRITICAL: ALL 'description' and 'placeDetails' fields across hotels, itinerary, restaurants, and experiences MUST be highly detailed, engaging, and comprehensive (minimum 3 to 4 sentences). DO NOT write short 1-line descriptions.
- NO trailing commas. NO comments.
- All numbers must be bare; all strings must be double-quoted.
- Return ONLY raw JSON. No markdown backticks.

Respond ONLY with raw JSON. Begin with { and end with }.
`;

export const HIDDEN_GEMS_AI_PROMPT = `
Generate a detailed, budget-conscious trip plan for {traveler} visiting {location} for {totalDays} days and {totalNight} nights, focusing EXCLUSIVELY on "Hidden Gems" and off-the-beaten-path locations. The budget is {budget}.

### DURATION AUTO-CORRECTION:
Evaluate if the destination '{location}' is a specific local attraction, a single monument/landmark, or a small neighborhood/day-trip spot (e.g. "Elephanta Caves", "Colaba", "Bandra West") rather than a full city/region. If the requested duration of {totalDays} days is excessive to enjoy there, you MUST auto-correct the itinerary duration to a realistic length (e.g., 1 day for Elephanta Caves) and generate a shorter itinerary matching that corrected duration.
If you scale down/adjust the duration, set "adjustedDuration" to the new number of days (e.g., 1) and provide a professional, friendly explanation in the top-level "adjustedDurationReason" string (e.g., "We noticed Elephanta Caves is best enjoyed as a 1-day trip! We've optimized your itinerary for the perfect day out."). If no auto-correction is needed, set "adjustedDuration" to {totalDays} and "adjustedDurationReason" to null.

### HOTEL SELECTION (HYBRID RULE):
If you have auto-corrected the trip to be a 1-day/day-trip excursion, or if {location} is a landmark/monument that does not have or require overnight stays/hotels, set "hotelOptions" to an empty array [] in your JSON output. Otherwise, list 5-6 hotel options.

IMPORTANT: Avoid the top 20 most famous tourist attractions. Focus on local secrets, secluded nature spots, quiet cultural sites, and non-commercialized areas.

### STRICT EXCLUSIONS:
- NO mainstream landmarks (e.g. if Paris, NO Eiffel Tower).
- NO "Hotel Check-in/out".
- NO generic "Lunch/Dinner/Fine Dining".
- NO tourist traps. Every spot must feel like a "local's secret".

Follow these instructions carefully:

1. Transport, Weather & Duration (REQUIRED):
   At the top level, include:
   - "departureIata": "3-letter origin code"
   - "destinationIata": "3-letter destination code"
   - "bestTransport": "Specific advice on reaching these remote spots (e.g., local buses, bike rentals, or specific hiking paths)."
   - "weatherInsight": "Short packing/weather tip for the current month."
   - "adjustedDuration": number (the final duration in days, either the requested {totalDays} or the adjusted shorter number of days).
   - "adjustedDurationReason": string or null (if duration was corrected, explain why; otherwise null).

2. Hotel options (5-6):
   - Focus on boutique stays, local homestays, or unique heritage properties. (Set to empty array [] if it is a day-trip or hotel stays are not needed).
   - Each hotel must include: hotelName, hotelAddress, pricePerNight (in ₹), geoCoordinates {"latitude": number, "longitude": number}, rating (0–5), description, and suitabilityReason.

3. Daily itinerary (The "Pool" Logic):
   - Use the key "dailyItinerary".
   - Provide a large collection of attractions that are NOT mainstream.
   - Include exactly {totalPlaces} "places" objects in a single array under "dailyItinerary" (unless you scaled down the trip duration, in which case generate exactly adjustedDuration * 4 places, i.e., 4 places per day).
   - Each "place" must include a field "timeSlot" with values: "Morning", "Afternoon", or "Evening".
   - Ensure there are exactly {perSlot} places for EACH time slot (unless scaled down, in which case ensure balanced distribution).
   - Structure: placeName, placeDetails, geoCoordinates: {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, timeSlot, vibe, and searchKeyword.

4. Recommendations:
   - Use the key "recommendations".
   - "restaurants": Provide exactly {totalRecs} hole-in-the-wall or highly-rated local eateries. Include: restaurantName, description, priceRange (one of: Cheap, Moderate, Premium), address, approximateCost, geoCoordinates {"latitude": number, "longitude": number}, and recommendedDishes (Array).
   - "localExperiences": Provide exactly {totalRecs} unique experiences. Include: experienceName, description, ticketPricing, address, geoCoordinates, and vibe.

5. Metadata:
   - "tripName": "City, CountryCode" (e.g., "Hampi, IND").
   - "tripDuration": "X days, Y nights" where X is the final duration in days and Y is X-1 nights.

6. JSON SYNTAX RULES (STRICT):
- CRITICAL: ALL 'description' and 'placeDetails' fields across hotels, itinerary, restaurants, and experiences MUST be highly detailed, engaging, and comprehensive (minimum 3 to 4 sentences). DO NOT write short 1-line descriptions.
- NO trailing commas. NO comments. NO extra text.
- Every opening brace '{' MUST have a matching closing brace '}'.
- Ensure "geoCoordinates" is a complete object: {"latitude": number, "longitude": number}.
- Double-check that all strings are enclosed in double quotes.

Respond ONLY with raw JSON. Begin with { and end with }.
`;

export const FESTIVE_AI_PROMPT = `
Generate a detailed, budget-conscious festive trip plan for {traveler} visiting {location} during the {festival} festival for {totalDays} days and {totalNight} nights. The budget is {budget}.

### DURATION AUTO-CORRECTION:
Evaluate if the destination '{location}' is a specific local attraction, a single monument/landmark, or a small neighborhood/day-trip spot (e.g. "Elephanta Caves", "Colaba", "Bandra West") rather than a full city/region. If the requested duration of {totalDays} days is excessive to enjoy there, you MUST auto-correct the itinerary duration to a realistic length (e.g., 1 day for Elephanta Caves) and generate a shorter itinerary matching that corrected duration.
If you scale down/adjust the duration, set "adjustedDuration" to the new number of days (e.g., 1) and provide a professional, friendly explanation in the top-level "adjustedDurationReason" string (e.g., "We noticed Elephanta Caves is best enjoyed as a 1-day trip! We've optimized your itinerary for the perfect day out."). If no auto-correction is needed, set "adjustedDuration" to {totalDays} and "adjustedDurationReason" to null.

### HOTEL SELECTION (HYBRID RULE):
If you have auto-corrected the trip to be a 1-day/day-trip excursion, or if {location} is a landmark/monument that does not have or require overnight stays/hotels, set "hotelOptions" to an empty array [] in your JSON output. Otherwise, list 5-6 hotel options.

### VISION: Focus on deep cultural participation and local rituals. 

### STRICT EXCLUSIONS:
- NO "Hotel Check-in/out".
- NO generic dining entries. All dining must be festive-themed.
- NO standard sightseeing; prioritize the {festival} heartland.

Follow these instructions carefully to ensure the trip captures the cultural essence of {festival}:

1. Transport, Weather & Duration (REQUIRED):
   At the top level, include:
   - "departureIata": "3-letter origin code"
   - "destinationIata": "3-letter destination code"
   - "bestTransport": "Specific advice for festive commute (e.g., local shuttles, walking zones, or avoiding specific busy routes)."
   - "weatherInsight": "Short packing/weather tip for the current month."
   - "adjustedDuration": number (the final duration in days, either the requested {totalDays} or the adjusted shorter number of days).
   - "adjustedDurationReason": string or null (if duration was corrected, explain why; otherwise null).

2. Hotel options (5-6):
   - Must be centrally located with easy access to main festive events or temples. (Set to empty array [] if it is a day-trip or hotel stays are not needed).
   - Each hotel must include: hotelName, hotelAddress, pricePerNight (in ₹), geoCoordinates {"latitude": number, "longitude": number}, rating (0–5), description, and suitabilityReason.

3. Daily itinerary (The "Pool" Logic):
   - Use the key "dailyItinerary".
   - Provide a large collection of attractions specifically curated for the {festival}.
   - Include exactly {totalPlaces} "places" objects in a single array under "dailyItinerary" (unless you scaled down the trip duration, in which case generate exactly adjustedDuration * 4 places, i.e., 4 places per day).
   - Each "place" must include a field "timeSlot" with values: "Morning", "Afternoon", or "Evening".
   - Ensure there are exactly {perSlot} places for EACH time slot (unless scaled down, in which case ensure balanced distribution).
   - At least 50% of these places MUST be related to {festival}.
   - Structure: placeName, placeDetails, geoCoordinates: {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, timeSlot, vibe, and searchKeyword.

4. Recommendations:
   - Use the key "recommendations".
   - "restaurants": Provide exactly {totalRecs} authentic restaurants nearby. Include restaurantName, description, priceRange (one of: Budget, Mid-range, Premium), address, approximateCost, geoCoordinates, and recommendedDishes (Array).
   - "localExperiences": Provide exactly {totalRecs} unique experiences related to {festival}. Include: experienceName, description, ticketPricing, address, geoCoordinates, and vibe.

5. Metadata:
   - "tripName": "City, CountryCode" (e.g., "Varanasi, IND").
   - "tripDuration": "X days, Y nights" where X is the final duration in days and Y is X-1 nights.

6. JSON SYNTAX RULES (STRICT):
- CRITICAL: ALL 'description' and 'placeDetails' fields across hotels, itinerary, restaurants, and experiences MUST be highly detailed, engaging, and comprehensive (minimum 3 to 4 sentences). DO NOT write short 1-line descriptions.
- NO trailing commas. NO comments. NO extra text.
- Every opening brace '{' MUST have a matching closing brace '}'.
- Ensure "geoCoordinates" is a complete object: {"latitude": number, "longitude": number}.
- Double-check that all strings are enclosed in double quotes.

Respond ONLY with raw JSON. Begin with { and end with }.
`;

export const CONCERT_TRIP_AI_PROMPT = `
Generate a boutique, experience-focused travel plan for {travelers} attending {artist} in {location}.

### VISION: Focus on the fan community atmosphere and venue-vicinity vibes. 

### STRICT EXCLUSIONS:
- NO "Hotel Check-in/out" or "Travel to venue".
- NO generic "Fine Dining".
- NO non-music-related standard sightseeing unless it is a "must-see" near the venue.

Travelers depart from {departure} for a fixed duration of 3 days and 2 nights. The budget is {budget}.

1. Transport (REQUIRED):
   Include these specific fields at the VERY TOP of your JSON response:
   - "departureIata": "3-letter origin code (e.g., BOM)"
   - "destinationIata": "3-letter destination code (e.g., LHR)"
   - "bestTransport": "Specific advice for fans (e.g., shuttles to {venueName}, event-day metro passes, or walkable nearby zones)."

2. Hotel Options (5–6):
   - Must be located near {venueName} or with easy transit to it.
   - Include: hotelName, hotelAddress, pricePerNight (in ₹), geoCoordinates {"latitude": number, "longitude": number}, rating (0–5), description, and suitabilityReason.

3. Daily Itinerary (The "Pool" Logic):
   - Use the key "dailyItinerary".
   - Include exactly 9 "places" objects in a single array under "dailyItinerary".
   - Each "place" must include a field "timeSlot" with values: "Morning", "Afternoon", or "Evening".
   - Ensure there are exactly 3 places for EACH time slot.
   - Crucial: At least 2 of the "Evening" slots must focus on the concert event or pre-concert fan meetups.
   - Each place must include: placeName, placeDetails, placeImageURL, geoCoordinates {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, timeSlot, vibe, and searchKeyword.

4. Recommendations:
   - Use the key "recommendations".
   - "restaurants": 5 options. Include restaurantName, description, priceRange (one of: Budget, Mid-range, Premium), address, approximateCost, geoCoordinates {"latitude": number, "longitude": number}, and recommendedDishes (Array).
   - "localExperiences": 3 options. Include experienceName, description, ticketPricing, address, geoCoordinates, and vibe.

5. Metadata:
   - "tripName": "{location}, CountryCode" (e.g., "London, GBR").
   - "tripDuration": "3 days, 2 nights".

6. JSON SYNTAX RULES (STRICT):
  - CRITICAL: ALL 'description' and 'placeDetails' fields across hotels, itinerary, restaurants, and experiences MUST be highly detailed, engaging, and comprehensive (minimum 3 to 4 sentences). DO NOT write short 1-line descriptions.
  - NO trailing commas after the last item in an array or object.
  - NO comments or extra text.
  - Every opening brace '{' MUST have a matching closing brace '}'.
  - Ensure "geoCoordinates" is a complete, closed object: {"latitude": 12.3, "longitude": 45.6}.
  - Double-check that all strings are enclosed in double quotes.

Respond ONLY with raw JSON. No markdown, no explanation, no surrounding text. Begin with { and end with }.
`;

export const CONCERT_LOCATION_DATE_PROMPT = `
You are helping plan a trip for a music fan to attend a live concert.

Artist: {artist}  
Date: {date}  

User is open to traveling to any city where the artist has an upcoming tour.

1. Search for the **next 5 upcoming tour dates** (concerts) for the artist {artist}.
2. Each concert must:
   - Be **at least 10 days from the present date**.
   - Be in a **popular or accessible city**.
   - Have all of the following fields:
     - concertCity
     - concertDate (YYYY-MM-DD)
     - venueName
     - venueAddress
     - geoCoordinates (format: { "lat": number, "lon": number })
     - concertImageURL
     - ticketPrice (example: "$120")

3. Respond ONLY in this JSON format:
[
  {
    "concertCity": "City",
    "concertDate": "YYYY-MM-DD",
    "venueName": "Venue",
    "venueAddress": "Full address of the venue",
    "geoCoordinates": { "lat": number, "lon": number },
    "concertImageURL": "https://link-to-image.jpg",
    "ticketPrice": "$100"
  }
]
`;

export const TRENDING_PLACE_PROMPT = `
You are helping a traveler discover trending places near their location.

Current Location: {location}  

1. Search for the **top 10 trending travel destinations** within 300 km of {location}.
2. Each place must:
   - Be **currently popular or trending** (festivals, seasonal events, natural beauty, cultural spots, or social media buzz).
   - Be safe and accessible for travelers.
   - Include a **variety of experiences** (nature, culture, history, adventure, relaxation).
   - Have all of the following fields:
     - id (unique number starting from 1)
     - name (place name)
     - title (place name + state)
     - desc (Short description of why this place is trending now in 20 words.)

3. Respond ONLY in this JSON format:
[
  {
    "id": 1,
    "name": "Place",
    "title": "Place, State",
    "desc": "Short description of why this place is trending now in 20 words."
  }
]
`;

export const TRAVEL_AI_PROMPT = `
You are a travel data generator.

Generate transportation details for a {tripType} trip from {departure} to {location} on {date}.

Rules:
a. Return valid JSON only — no extra text.
b. Follow this schema:
   - For "Oneway":
       {
         "transportDetails": {
           "outbound": [ ...3–5 transport options... ]
         }
       }
   - For "Round":
       {
         "transportDetails": {
           "outbound": [ ...3–5 options from {departure} → {location}... ],
           "return": [ ...3–5 options from {location} → {departure}... ]
         }
       }

c. Each transport option object must include:
   - transportType ("Flight" or "Train")
   - transportNumber
   - from (departure airport/station code or city)
   - to (arrival airport/station code or city)
   - departureTime (ISO 8601 format)
   - arrivalTime (ISO 8601 format)
   - provider (e.g., IndiGo, IRCTC)
   - price (number, in ₹)
   - bookingURL (see rule 6)
   - stops (0 or 1)
   - duration (e.g., "2h 15m")

d. Always suggest the most direct and logical route to reach {location}, minimizing unnecessary detours.
e. Prefer arrival airports or train stations closest to {location}.
f. Do not include more than one intermediate stop (maximum 1 connection).
g. If a direct option exists (flight/train), always list it first.

h. Booking URL format:
   - If transportType = "Flight":
     "https://www.makemytrip.com/flight/search?itinerary={FROM}-{TO}-{flightDate}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E&lang=eng"
   - If transportType = "Train":
     "https://www.makemytrip.com/railways/listing?date={trainDate}&srcStn={FROM_CODE}&srcCity={FROM_CITY}&destStn={TO_CODE}&destCity={TO_CITY}&classCode={CLASS}"

i. Avoid routes that go in the opposite direction or significantly increase travel time.
j. Keep JSON clean, human-readable, and ready for frontend use.
`;
