export const AI_PROMPT = `
Generate a detailed, budget-conscious trip plan for {traveler} visiting {location} for {totalDays} days and {totalNight} nights. The budget for this trip is {budget}.

Follow these instructions carefully:

1. Hotel options (5-6):
   - Each hotel must include:
     - hotelName
     - hotelAddress
     - pricePerNight (in ₹)
     - hotelImageURL (real or relevant image URL)
     - geoCoordinates with accurate latitude and longitude for the hotel
     - rating (0–5)
     - description (short)

2. Daily itinerary (The "Pool" Logic):
   - Use the key "dailyItinerary".
   - Provide a large collection of attractions.
   - Include exactly {totalPlaces} "places" objects in a single array under "dailyItinerary".
   - Each "place" must include a field "timeSlot" with values: "Morning", "Afternoon", or "Evening".
   - Ensure there are exactly {perSlot} places for EACH time slot.
   - Structure: placeName, placeDetails, geoCoordinates: {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, timeSlot.

3. Recommendations:
   - Use the key "recommendations".
   - "restaurants": Provide exactly {totalRecs} authentic restaurants. Each must include: restaurantName, description, priceRange, address, approximateCost, and geoCoordinates {"latitude": number, "longitude": number}.
   - "localExperiences": Provide exactly {totalRecs} unique experiences. Each must include: experienceName, description, priceRange, approximateCost, and geoCoordinates {"latitude": number, "longitude": number}.

4. Include a top-level field called "tripName" formatted as "City, CountryCode" (e.g., "Delhi, IND").

5. Ensure the trip fits the provided budget and classify it as:
   - "Budget" (< ₹10,000)
   - "Moderate" (₹10,000–₹25,000)
   - "Luxury" (> ₹25,000)

6. Include a field called "tripDuration" formatted like "{totalDays} days, {totalNight} nights".

7. Transport Metadata (REQUIRED):
   Include these two specific fields at the VERY TOP of your JSON response:
   - "departureIata": "3-letter origin code"
   - "destinationIata": "3-letter destination code"

8. JSON SYNTAX RULES (STRICT):
- NO trailing commas after the last item in an array or object.
- NO comments or extra text.
- Every opening brace '{' MUST have a matching closing brace '}'.
- Ensure "geoCoordinates" is a complete, closed object: {"latitude": 12.3, "longitude": 45.6}.
- IMPORTANT: Verify that the "hotelOptions" array objects are fully closed before starting the "dailyItinerary".
- Double-check that all strings are enclosed in double quotes.

Ensure:
- All content is realistic and based on actual locations and data.
- All coordinates and links are valid and sensible.
- Always return the same JSON structure with stable keys and order.

Respond ONLY with raw JSON. No markdown, no explanation, no surrounding text. Begin with { and end with }.
`;

export const HIDDEN_GEMS_AI_PROMPT = `
Generate a detailed, budget-conscious trip plan for {traveler} visiting {location} for {totalDays} days and {totalNight} nights, focusing EXCLUSIVELY on "Hidden Gems" and off-the-beaten-path locations. The budget is {budget}.

IMPORTANT: Avoid the top 10 most famous tourist attractions. Focus on local secrets, secluded nature spots, quiet cultural sites, and non-commercialized areas.

Follow these instructions carefully:

1. Hotel options (5-6):
   - Focus on boutique stays, local homestays, or unique heritage properties.
   - Each hotel must include: hotelName, hotelAddress, pricePerNight (in ₹), hotelImageURL, geoCoordinates {"latitude": number, "longitude": number}, rating (0–5), and a short description.

2. Daily itinerary (The "Pool" Logic):
   - Use the key "dailyItinerary".
   - Provide a large collection of attractions that are NOT mainstream.
   - Include exactly {totalPlaces} "places" objects in a single array under "dailyItinerary".
   - Each "place" must include a field "timeSlot" with values: "Morning", "Afternoon", or "Evening".
   - Ensure there are exactly {perSlot} places for EACH time slot.
   - Structure: placeName, placeDetails, geoCoordinates: {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, timeSlot.

3. Recommendations:
   - Use the key "recommendations".
   - "restaurants": Provide exactly {totalRecs} hole-in-the-wall or highly-rated local eateries. Include: restaurantName, description, priceRange, address, approximateCost, and geoCoordinates {"latitude": number, "longitude": number}.
   - "localExperiences": Provide exactly {totalRecs} unique experiences. Include: experienceName, description, priceRange, approximateCost, and geoCoordinates {"latitude": number, "longitude": number}.

4. Include a top-level field called "tripName" formatted as "City, CountryCode" (e.g., "Hampi, IND").

5. Ensure the trip fits the provided budget and classify it as:
   - "Budget" (< ₹10,000), "Moderate" (₹10,000–₹25,000), or "Luxury" (> ₹25,000).

6. Include a field called "tripDuration" formatted like "{totalDays} days, {totalNight} nights".

7. Transport Metadata (REQUIRED):
   Include these two specific fields at the VERY TOP of your JSON response:
   - "departureIata": "3-letter origin code"
   - "destinationIata": "3-letter destination code"

8. JSON SYNTAX RULES (STRICT):
- NO trailing commas. NO comments. NO extra text.
- Every opening brace '{' MUST have a matching closing brace '}'.
- Ensure "geoCoordinates" is a complete object: {"latitude": number, "longitude": number}.
- Double-check that all strings are enclosed in double quotes.

Respond ONLY with raw JSON. Begin with { and end with }.
`;

export const FESTIVE_AI_PROMPT = `
Generate a detailed, budget-conscious festive trip plan for {traveler} visiting {location} during the {festival} festival for {totalDays} days and {totalNight} nights. The budget is {budget}.

Follow these instructions carefully to ensure the trip captures the cultural essence of {festival}:

1. Hotel options (5-6):
   - Must be centrally located with easy access to main festive events or temples.
   - Each hotel must include: hotelName, hotelAddress, pricePerNight (in ₹), hotelImageURL, geoCoordinates {"latitude": number, "longitude": number}, rating (0–5), and a short description.

2. Daily itinerary (The "Pool" Logic):
   - Use the key "dailyItinerary".
   - Provide a large collection of attractions specifically curated for the {festival}.
   - Include exactly {totalPlaces} "places" objects in a single array under "dailyItinerary".
   - Each "place" must include a field "timeSlot" with values: "Morning", "Afternoon", or "Evening".
   - Ensure there are exactly {perSlot} places for EACH time slot.
   - At least 50% of these places MUST be related to {festival}.
   - Structure: placeName, placeDetails, geoCoordinates: {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, timeSlot.

3. Recommendations:
   - Use the key "recommendations".
   - "restaurants": Provide exactly {totalRecs} authentic restaurants nearby. Include restaurantName, description, priceRange, address, approximateCost, and geoCoordinates.
   - "localExperiences": Provide exactly {totalRecs} unique experiences related to {festival}. Include: experienceName, description, priceRange, approximateCost, and geoCoordinates.

4. Include a top-level field called "tripName" formatted as "City, CountryCode" (e.g., "Varanasi, IND").

5. Ensure the trip fits the provided budget and classify it as:
   - "Budget" (< ₹10,000), "Moderate" (₹10,000–₹25,000), or "Luxury" (> ₹25,000).

6. Include a field called "tripDuration" formatted like "{totalDays} days, {totalNight} nights".

7. Transport Metadata (REQUIRED):
   Include these two specific fields at the VERY TOP of your JSON response:
   - "departureIata": "3-letter origin code"
   - "destinationIata": "3-letter destination code"

8. JSON SYNTAX RULES (STRICT):
- NO trailing commas. NO comments. NO extra text.
- Every opening brace '{' MUST have a matching closing brace '}'.
- Ensure "geoCoordinates" is a complete object: {"latitude": number, "longitude": number}.
- Double-check that all strings are enclosed in double quotes.

Respond ONLY with raw JSON. Begin with { and end with }.
`;

export const CONCERT_TRIP_AI_PROMPT = `
Generate a detailed, budget-conscious travel plan for {travelers} attending a live concert by {artist} in {location}.

Travelers depart from {departure} for a fixed duration of 3 days and 2 nights. The budget is {budget}.

1. Transport Metadata (REQUIRED):
   Include these specific fields at the VERY TOP of your JSON response:
   - "departureIata": "3-letter origin code (e.g., BOM)"
   - "destinationIata": "3-letter destination code (e.g., LHR)"

2. Hotel Options (5–6):
   - Must be located near {venueName} or with easy transit to it.
   - Include: hotelName, hotelAddress, pricePerNight (in ₹), hotelImageURL, geoCoordinates {"latitude": number, "longitude": number}, rating (0–5), and a short description.

3. Daily Itinerary (The "Pool" Logic):
   - Use the key "dailyItinerary".
   - Include exactly 9 "places" objects in a single array under "dailyItinerary".
   - Each "place" must include a field "timeSlot" with values: "Morning", "Afternoon", or "Evening".
   - Ensure there are exactly 3 places for EACH time slot.
   - Crucial: At least 2 of the "Evening" slots must focus on the concert event or pre-concert fan meetups.
   - Each place must include: placeName, placeDetails, placeImageURL, geoCoordinates {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, and timeSlot.

4. Recommendations:
   - Use the key "recommendations".
   - "restaurants": 5 options. Include restaurantName, description, priceRange, address, and approximateCost.
   - "localExperiences": 3 options. Include experienceName, description, priceRange, approximateCost, and geoCoordinates.

5. Trip Metadata:
   - "tripName": "{location}, CountryCode" (e.g., "London, GBR").
   - "tripDuration": "3 days, 2 nights".
   - "budgetCategory": "Budget" (< ₹10,000), "Moderate" (₹10,000–₹25,000), or "Luxury" (> ₹25,000).

6. JSON SYNTAX RULES (STRICT):
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
