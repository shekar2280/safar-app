import Ionicons from "@expo/vector-icons/Ionicons";

export const SelectTravelerList = [
  {
    id: 1,
    title: "Just Me",
    desc: "A solo traveler on a personal journey",
    icon: <Ionicons name="person" size={24} color="blue" />,
    people: "1",
  },
  {
    id: 2,
    title: "Couple",
    desc: "Two people traveling together",
    icon: <Ionicons name="person-add" size={24} color="pink" />,
    people: "2",
  },
  {
    id: 3,
    title: "Family",
    desc: "A family trip with parents and kids",
    icon: <Ionicons name="home" size={24} color="#F59E0B" />,
    people: "3 to 5",
  },
  {
    id: 4,
    title: "Friends",
    desc: "A fun trip with friends",
    icon: <Ionicons name="people" size={24} color="#10B981" />,
    people: "5 - 10",
  },
];

export const LOCAL_HOTEL_IMAGES = [
  require("../assets/images/hotel-images/hotel_image_1.jpg"),
  require("../assets/images/hotel-images/hotel_image_2.jpg"),
  require("../assets/images/hotel-images/hotel_image_3.jpg"),
  require("../assets/images/hotel-images/hotel_image_4.jpg"),
  require("../assets/images/hotel-images/hotel_image_5.jpg"),
  require("../assets/images/hotel-images/hotel_image_6.jpg"),
  require("../assets/images/hotel-images/hotel_fallback.jpg"),
];

export const concertImages = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766237162/concert-1_qwv2qb.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766237166/concert-2_d2edym.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766237180/concert-3_zwbgrr.jpg",
];

export const fallbackImages = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/f_auto,q_auto,w_800/v1766143095/fallback_image1_oquhsp.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/f_auto,q_auto,w_800/v1766143097/fallback_image3_mogvf0.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/f_auto,q_auto,w_800/v1766143100/fallback_image2_y6jkri.jpg",
];

export const trendingTripCardImages = [
  require("../assets/images/trending-places/trending-place1.jpg"),
  require("../assets/images/trending-places/trending-place2.jpg"),
  require("../assets/images/trending-places/trending-place3.jpg"),
  require("../assets/images/trending-places/trending-place4.jpg"),
  require("../assets/images/trending-places/trending-place5.jpg"),
]


export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Cheap",
    desc: "Budget-friendly choices ",
    icon: "🪙",
  },
  {
    id: 2,
    title: "Moderate",
    desc: "Balanced spending ",
    icon: "💰",
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Premium picks ",
    icon: "💎",
  },
];

export const AI_PROMPT = `
Generate a detailed, budget-conscious trip plan for {traveler} visiting {location} for {totalDays} days and {totalNight} nights. The budget for this trip is {budget}.

Follow these instructions carefully:

1. You are a travel data generator.

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
     *Note: Use the exact date provided as input; do not change the year, month, or day.*
   - If transportType = "Train":
     "https://www.makemytrip.com/railways/listing?date={trainDate}&srcStn={FROM_CODE}&srcCity={FROM_CITY}&destStn={TO_CODE}&destCity={TO_CITY}&classCode={CLASS}"
     *Note: Convert the input date to 8-digit format (YYYYMMDD) exactly as given. Do not alter the year or month.*

i. Avoid routes that go in the opposite direction or significantly increase travel time.
j. Keep JSON clean, human-readable, and ready for frontend use.


2. Hotel options (5-6):
   - Each hotel must include:
     - hotelName
     - hotelAddress
     - pricePerNight (in ₹)
     - hotelImageURL (real or relevant image URL)
     - geoCoordinates with accurate latitude and longitude for the hotel
     - rating (0–5)
     - description (short)

3. Daily itinerary:
   - Use a top-level key called "dailyItinerary"
   - Include a plan for each day of the trip using keys: day1, day2, ..., day{totalDays}
   - Do not skip any day, even if it overlaps with travel
   - If arrival is late on day1 or departure is early on the last day, suggest light/local activities accordingly
   - For each day, include an object with a key "places" that holds an array of 2–3 real places to visit in/around the location
   - Each item inside "places" must follow this structure:
     - placeName: Name of the place
     - placeDetails: A brief description
     - placeImageURL: A real image URL if available, or use a relevant placeholder
     - geoCoordinates: Accurate format {"latitude": number, "longitude": number}
     - ticketPricing: Cost in ₹, or 0 if free
     - estimatedTravelTime: Time to reach from previous location or hotel (e.g., "20 minutes")
     - bestTimeToVisit: A short text like "Morning (9 AM - 11 AM)"

4. Recommendations:
   +  Use a top-level key called "recommendations".
+  It must contain two arrays: "restaurants" and "localExperiences".
+
+  - For "restaurants":  
+    - Provide exactly 5 restaurants that are well-known, authentic, and close to {location}.  
+    - Each entry must include:  
+      - restaurantName (real, existing place if possible)  
+      - description (2–3 sentences highlighting cuisine, vibe, or specialty dish)  
+      - priceRange ("Budget", "Moderate", "High")  
+      - address (with city/area)  
+      - approximateCost (per person in ₹)  
+
+  - For "localExperiences":  
+    - Provide exactly 5 experiences or activities unique to {location} (e.g., cultural walk, local market, cooking class, adventure activity).  
+    - Each entry must include:  
+      - experienceName  
+      - description (2–3 sentences about what the traveler will do/see/learn)  
+      - priceRange ("Budget", "Moderate", "High")  
+      - approximateCost (per person in ₹, or 0 if free)  


5. Include a top-level field called "tripName" formatted as "City, CountryCode" (e.g., "Delhi, IND").

6. Ensure the trip fits the provided budget and classify it as:
   - "Budget" (< ₹10,000)
   - "Moderate" (₹10,000–₹25,000)
   - "Luxury" (> ₹25,000)

7. Include a field called "tripDuration" formatted like "3 days, 2 nights".

Ensure:
- All content is realistic and based on actual locations and data.
- All coordinates and links are valid and sensible.
- Always return the same JSON structure with stable keys and order.

Respond ONLY with raw JSON. No markdown, no explanation, no surrounding text. Begin with { and end with }.
`;

export const TRAVEL_AI_PROMPT = `
You are a travel planner AI that generates transportation details between two locations.

Input parameters:
- tripType: either "Oneway" or "Round"
- departure: origin city
- location: destination city

Instructions:
1. For "Oneway":
   - Return a JSON object with a key "transportDetails" containing one sub-key:
     - "outbound": an array of 3–5 transport option objects from {departure} → {location}.

2. For "Round":
   - Return a JSON object with a key "transportDetails" containing two sub-keys:
     - "outbound": array of 3–5 options {departure} → {location}.
     - "return": array of 3–5 options {location} → {departure}.

3. Each transport option object must include these exact fields:
   - transportType: "Flight" or "Train"
   - transportNumber: e.g., "6E-6102" or "12301 Rajdhani Express"
   - from: departure airport/station code or city name
   - to: arrival airport/station code or city name
   - departureTime: e.g., "07:30 AM"
   - arrivalTime: e.g., "11:15 AM"
   - provider: airline or railway name (e.g., IndiGo, Air India, IRCTC)
   - price: ticket price in ₹
   - bookingURL: a realistic booking link (e.g., MakeMyTrip, IRCTC)
   - tripDuration: formatted like "3 days, 2 nights"

4. Rules for routing:
   - Always choose the most direct and logical route.
   - Prefer arrival airports/train stations closest to {location}.
   - Do not include more than one intermediate stop (max 1 connection).
   - If a direct option exists, always list it first.
   - Avoid routes that go opposite to the direction or significantly increase travel time.

Return ONLY a valid JSON object with no extra text, markdown, or explanations.
`;
export const HOTEL_AI_PROMPT = `
Generate 5–6 hotel options in or near {location} for a {budget} trip.

Each hotel object must include these exact fields:
- hotelName
- hotelAddress
- pricePerNight (in ₹)
- hotelImageURL (real or relevant image URL)
- geoCoordinates: {"latitude": number, "longitude": number}
- rating (0–5)
- description (short, 1–2 sentences)
- amenities: array of 4–6 amenities (e.g., "Free WiFi", "Breakfast Included", "Pool")

Rules:
- Only include hotels that realistically fit the {budget} range.
- Prefer hotels that are close to main attractions in {location}.
- Include a mix of 3-star to 5-star (for "Luxury") or budget stays (for "Budget").
- Ensure all data feels realistic and consistent with actual geography.
- Avoid placeholder names like “Hotel ABC”.

Return ONLY a JSON object with the following structure:
{
  "hotels": [ ... ]
}

Respond only with JSON — no markdown, explanations, or additional text.
`;
export const DAILY_ITINERARY_AI_PROMPT = `
Generate a detailed {totalDays}-day daily itinerary for a traveler visiting {location}.

Use the key "dailyItinerary" at the top level.
Include exactly {totalDays} days (day1, day2, ..., day{totalDays}).

For each day:
- Include a key "places" that holds an array of 2–3 real places to visit.
- Each item inside "places" must include:
  - placeName
  - placeDetails (short description)
  - placeImageURL (real or relevant image URL)
  - geoCoordinates: {"latitude": number, "longitude": number}
  - ticketPricing (in ₹, 0 if free)
  - estimatedTravelTime ("15 minutes", etc.)
  - bestTimeToVisit ("Morning", "Evening", etc.)

Rules:
- If arrival is late on day1 or departure is early on the last day, plan light/local activities.
- Choose real and logical routes (don’t jump far locations in one day).
- Use real landmarks, museums, parks, or cultural sites.

Return ONLY JSON starting with { and ending with }:
{
  "dailyItinerary": { ... }
}
`;
export const LOCAL_EXPERIENCE_AI_PROMPT = `
Generate 5 authentic local experiences or activities unique to {location}.

Use the key "localExperiences" at the top level.

Each experience must include:
- experienceName
- description (2–3 sentences about what the traveler will do or see)
- priceRange: "Budget", "Moderate", or "High"
- approximateCost (per person in ₹, 0 if free)
- locationHint: short area/neighborhood text (e.g., "Old Delhi", "Juhu Beach")
- geoCoordinates: {"latitude": number, "longitude": number}

Rules:
- Focus on real, culture-driven, or adventure experiences.
- Avoid generic or repeated names.
- Include a variety (e.g., cooking class, night market, temple walk, boat ride).

Return only JSON:
{
  "localExperiences": [ ... ]
}
`;
export const RESTAURANT_AI_PROMPT = `
Generate 5 restaurant recommendations in or near {location}.

Use the key "restaurants" at the top level.

Each restaurant must include:
- restaurantName (real or realistic)
- description (2–3 sentences highlighting cuisine, vibe, or specialty dish)
- cuisineType ("Indian", "Italian", "Seafood", etc.)
- priceRange: "Budget", "Moderate", or "High"
- approximateCost (per person in ₹)
- address (with area/city)
- rating (0–5)
- geoCoordinates: {"latitude": number, "longitude": number}
- imageURL (real or relevant placeholder)

Rules:
- Prefer authentic, well-reviewed local restaurants.
- Keep realistic prices based on {budget}.
- Ensure a good variety of cuisines (not all Indian, not all luxury).
- Avoid fictional or repetitive names.

Return only JSON starting with { and ending with }:
{
  "restaurants": [ ... ]
}
`;

export const DiscoverIdeasList = [
  {
    id: 1,
    title: "Trending Places",
    desc: "Trending places near you",
    route: "/discover-trip/trending-places/select-departure",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933449/trending_zz1svj.png",
  },
  {
    id: 2,
    title: "Hidden Gems ",
    desc: "Discover underrated and offbeat destinations",
    route: "/discover-trip/hidden-gems/select-destination",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933447/hidden_gems_y5qu3m.webp",
  },
  // {
  //   id: 2,
  //   title: "Match Day Trips ",
  //   desc: "Plan trips based on your favorite team's matches",
  //   route: "/discover-trip/sports-trip/select-sport",
  //   image: require("../assets/images/sports.jpg"),
  // },
  {
    id: 3,
    title: "Concert Nights ",
    desc: "Catch your favorite artists live",
    route: "/discover-trip/concert-trips/select-artist",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933446/concert_pxshln.jpg",
  },
  {
    id: 4,
    title: "Festive Getaways ",
    desc: "Trips during local or global festivals",
    route: "/discover-trip/festive-trips/select-destination",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933446/festive_rjm4kc.jpg",
  },
];

export const DiscoverTripIdeas = [
  {
    id: 1,
    title: "Tawang, Arunachal Pradesh",
    desc: "Explore serene monasteries and Himalayan landscapes in this remote gem.",
    image: require("../assets/images/hidden-gems/tawang.jpg"),
  },
  {
    id: 2,
    title: "Gokarna, Karnataka",
    desc: "Unwind at peaceful beaches and ancient temples away from Goa crowds.",
    image: require("../assets/images/hidden-gems/gokarna.jpg"),
  },
  {
    id: 3,
    title: "Chopta, Uttarakhand",
    desc: "Trek through alpine meadows to Tungnath, the world’s highest Shiva temple.",
    image: require("../assets/images/hidden-gems/chopta.jpg"),
  },
  {
    id: 4,
    title: "Majuli, Assam",
    desc: "Visit the world’s largest river island with rich culture and monasteries.",
    image: require("../assets/images/hidden-gems/majuli.jpg"),
  },
  {
    id: 5,
    title: "Halebidu, Karnataka",
    desc: "Marvel at exquisite Hoysala-era temple carvings and architecture.",
    image: require("../assets/images/hidden-gems/halebidu.jpg"),
  },
  {
    id: 6,
    title: "Ziro Valley, Arunachal Pradesh",
    desc: "Experience Apatani tribal culture amidst rolling hills and rice fields.",
    image: require("../assets/images/hidden-gems/ziro_valey.jpg"),
  },
  {
    id: 7,
    title: "Mawlynnong, Meghalaya",
    desc: "Stroll through Asia’s cleanest village and see living root bridges.",
    image: require("../assets/images/hidden-gems/mawlynnong.jpg"),
  },
  {
    id: 8,
    title: "Patan, Gujarat",
    desc: "Step into history at Rani ki Vav, a beautifully carved stepwell.",
    image: require("../assets/images/hidden-gems/patan.png"),
  },
  {
    id: 9,
    title: "Lepakshi, Andhra Pradesh",
    desc: "See the hanging pillar and Vijayanagara-style murals at Veerabhadra Temple.",
    image: require("../assets/images/hidden-gems/lepakshi.jpg"),
  },
  {
    id: 10,
    title: "Chandratal, Himachal Pradesh",
    desc: "Camp by the moon-shaped lake in Spiti for a surreal high-altitude escape.",
    image: require("../assets/images/hidden-gems/chandratal-lake.jpg"),
  },
  {
    id: 11,
    title: "Hampi, Karnataka",
    desc: "Walk among the ruins of the Vijayanagara Empire, a UNESCO heritage site.",
    image: require("../assets/images/hidden-gems/hampi.jpeg"),
  },
  {
    id: 12,
    title: "Velas, Maharashtra",
    desc: "Witness the Olive Ridley turtle festival in this peaceful Konkan village.",
    image: require("../assets/images/hidden-gems/velas.jpg"),
  },
  {
    id: 13,
    title: "Dzukou Valley, Nagaland",
    desc: "Trek across lush valleys and seasonal flowers on the Nagaland–Manipur border.",
    image: require("../assets/images/hidden-gems/dzukou_valley.jpg"),
  },
  {
    id: 14,
    title: "Chalakudy, Kerala",
    desc: "Discover Athirappilly Falls and lush greenery known as the 'Niagara of India'.",
    image: require("../assets/images/hidden-gems/chalakudy.jpg"),
  },
  {
    id: 15,
    title: "Mandu, Madhya Pradesh",
    desc: "Explore Afghan-style architecture and romantic ruins of this historic fort city.",
    image: require("../assets/images/hidden-gems/mandu.jpg"),
  },
  {
    id: 16,
    title: "Khimsar, Rajasthan",
    desc: "Stay in a desert fort and experience dunes away from Jaisalmer crowds.",
    image: require("../assets/images/hidden-gems/khimsar.jpg"),
  },
  {
    id: 17,
    title: "Tirthan Valley, Himachal Pradesh",
    desc: "Relax by rivers and waterfalls in a less commercialized Himalayan valley.",
    image: require("../assets/images/hidden-gems/tirthan.jpeg"),
  },
  {
    id: 18,
    title: "Lonar Crater, Maharashtra",
    desc: "See a unique lake formed by a meteor impact over 50,000 years ago.",
    image: require("../assets/images/hidden-gems/lonar.jpeg"),
  },
  {
    id: 19,
    title: "Araku Valley, Andhra Pradesh",
    desc: "Ride the scenic train and visit tribal coffee plantations in the Eastern Ghats.",
    image: require("../assets/images/hidden-gems/araku.jpg"),
  },
  {
    id: 20,
    title: "Kibber, Himachal Pradesh",
    desc: "Spot snow leopards and visit one of the world’s highest inhabited villages.",
    image: require("../assets/images/hidden-gems/kibber.jpg"),
  },
];

export const DiscoverTripImages = {
  "Tawang, Arunachal Pradesh": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232707/tawang_ji5iiy.jpg",
  "Gokarna, Karnataka": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232696/gokarna_gktdgn.jpg",
  "Chopta, Uttarakhand": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232695/chopta_grcfgg.jpg",
  "Majuli, Assam": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232702/majuli_ajibue.jpg",
  "Halebidu, Karnataka": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/halebidu_kb3oya.jpg",
  "Ziro Valley, Arunachal Pradesh": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232708/ziro_valey_sexmcr.jpg",
  "Mawlynnong, Meghalaya": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232704/mawlynnong_j8s0mg.jpg",
  "Patan, Gujarat": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232704/patan_pw8wrq.jpg",
  "Lepakshi, Andhra Pradesh": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/lepakshi_r99zfu.jpg",
  "Chandratal, Himachal Pradesh": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/chandratal-lake_aisjss.jpg",
  "Hampi, Karnataka": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/hampi_x1s3wg.jpg",
  "Velas, Maharashtra": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232708/velas_lwm1gg.jpg",
  "Dzukou Valley, Nagaland": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/dzukou_valley_jorfsl.jpg",
  "Chalakudy, Kerala": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/chalakudy_ve3xvo.jpg",
  "Mandu, Madhya Pradesh": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232703/mandu_rlj3yt.jpg",
  "Khimsar, Rajasthan": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/khimsar_p07v1z.jpg",
  "Tirthan Valley, Himachal Pradesh": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232707/tirthan_grq1vt.jpg",
  "Lonar Crater, Maharashtra": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/lonar_hfbcp7.jpg",
  "Araku Valley, Andhra Pradesh": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232695/araku_aa3dt9.jpg",
  "Kibber, Himachal Pradesh": "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/kibber_vgcilh.jpg",
}

// export const DISCOVER_AI_PROMPT = `
// Generate a detailed, budget-conscious trip plan for {traveler} visiting {location} for {totalDays} days and {totalNight} nights. The budget for this trip is {budget}.

// Follow these instructions carefully:

// 1. Transportation details ({tripType} from {departure} to {location}):
//    - For "Oneway": Return a key called "transportDetails" with a sub-key "outbound", which is an array of 3–5 transport options from {departure} → {location}.
//    - For "Round": Return a key called "transportDetails" with two sub-keys:
//        - "outbound": array of 3–5 options {departure} → {location}
//        - "return": array of 3–5 options {location} → {departure}
//    - Always suggest the most direct and logical route to reach {location}, minimizing unnecessary detours.
//    - Prefer arrival airports or train stations closest to {location}.
//    - Do not include more than one intermediate stop (maximum 1 connection).
//    - If a direct option exists (flight/train), always list it first.
//    - Avoid routes that go in the opposite direction or significantly increase travel time.
//    - Each transport option object inside outbound/return must include:
//      - transportType: "Flight" or "Train"
//      - transportNumber: e.g., "6E-6102" or "12301 Rajdhani Express"
//      - from (departure airport/station code or city)
//      - to (arrival airport/station code or city)
//      - departureTime
//      - arrivalTime
//      - provider: airline or railway (e.g., IndiGo, GoAir, IRCTC)
//      - price (in ₹)
//      - bookingURL (link to Makemytrip, IRCTC, etc.)

// 2. Hotel options (5-6):
//    - Each hotel must include:
//      - hotelName
//      - hotelAddress
//      - pricePerNight (in ₹)
//      - hotelImageURL
//      - geoCoordinates with accurate latitude and longitude
//      - rating (0–5)
//      - description (short)

// 3. Daily itinerary:
//    - Use a key "dailyItinerary"
//    - Include day1 to day{totalDays}
//    - Each day includes a key "places" which holds 2–3 places:
//      - placeName
//      - placeDetails
//      - placeImageURL
//      - geoCoordinates
//      - ticketPricing (₹)
//      - estimatedTravelTime
//      - bestTimeToVisit

// 4. Recommendations:
//    - Use "recommendations"
//    - Contains "restaurants" and "localExperiences"
//    - Give 5 each restaurants options and localExperiences
//    - Each item:
//      - name
//      - description
//      - priceRange ("Budget", "Moderate", "High")
//      - address or approximateCost

// 5. Include top-level fields:
//    - "tripName": formatted as "City, CountryCode"
//    - "tripDuration": like "3 days, 2 nights"
//    - "budgetCategory": "Budget" (< ₹10,000), "Moderate" (₹10,000–₹25,000), or "Luxury" (> ₹25,000)

// Ensure:
// - All data is realistic.
// - Coordinates and links are valid.
// - Use only JSON. Start with { and end with }.
// `;

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

export const CONCERT_TRIP_AI_PROMPT = `
You are an AI travel planner creating a budget-conscious trip for {travelers} to attend a live concert by {artist} on {concertDate}.  

The travelers depart from {departure} and want to travel to {location}, where the concert takes place.  

---

📅 **Trip Duration**: 3 Days, 2 Nights  
- **Day 1**: Arrival in {location}, hotel check-in, light local activities  
- **Day 2**: Attend the {artist} concert + sightseeing before/after as possible  
- **Day 3**: Return to {departure}, light activities if time permits  

---

## 🎯 JSON Output Schema (strict)

1. **concertDetails** (extra section only for concert trips)
   - artist  
   - concertDate  
   - concertStartTime  
   - concertEndTime  
   - venueName  
   - venueAddress  
   - ticketPrice (₹)  
   - bookingURL (official or ticket provider)  

2. Transportation details ({tripType} from {departure} to {location}):
- Return a key called "transportDetails".
- For "oneway":
  - transportDetails must contain a sub-key "outbound", which is an array of 3–5 transport options from {departure} → {location}.
- For "round":
  - transportDetails must contain two sub-keys:
    - "outbound": array of 3–5 options {departure} → {location}
    - "return": array of 3–5 options {location} → {departure}
- Each transport option must include:
  - transportType: "Flight" or "Train"
  - transportNumber
  - from (city/airport/station code)
  - to (city/airport/station code)
  - departureTime
  - arrivalTime
  - provider (e.g., IndiGo, IRCTC)
  - price (₹)
  - bookingURL (real working link)
- Rules:
  - Always suggest the most direct and logical route
  - Prefer arrival airports/stations closest to {location}
  - Do not include more than one intermediate stop (max 1 connection)
  - If a direct option exists, always list it first
  - Avoid illogical detours or routes going opposite direction

3. **hotelOptions** (5–6 options)  
   - hotelName  
   - hotelAddress  
   - pricePerNight (₹)  
   - hotelImageURL (real image link)  
   - geoCoordinates: { latitude, longitude }  
   - rating (0–5)  
   - description (1–2 sentences)  

4. **dailyItinerary**  
   - Keys: day1, day2, day3  
   - Each day includes:  
     - places: array of 2–3 places with:  
       - placeName  
       - placeDetails  
       - placeImageURL (real link)  
       - geoCoordinates { latitude, longitude }  
       - ticketPricing (₹ or "Free")  
       - estimatedTravelTime  
       - bestTimeToVisit  

5. **recommendations**  
   - restaurants: 5 options with:  
     - name  
     - description  
     - priceRange ("Budget" | "Moderate" | "High")  
     - address or approximateCost  
   - localExperiences: 5 options with:  
     - name  
     - description  
     - priceRange  
     - approximateCost  

6. **tripMetadata**  
   - tripName: "{location}, CountryCode"  
   - tripDuration: "3 days, 2 nights"  
   - budgetCategory:  
     - "Budget" (< ₹10,000)  
     - "Moderate" (₹10,000–₹25,000)  
     - "Luxury" (> ₹25,000)  
   - location: {location}  
   - totalDays: "3"  
   - travelers: {travelers}  

---

## Constraints
- **Concert must always be on Day 2**.  
- **Arrival (Day 1)** must fall between {startDate} and the day before {concertDate}.  
- **Return (Day 3)** is the day after the concert.  
- All geoCoordinates must be valid decimal numbers.  
- All bookingURL fields must be real working links (no placeholders).  
- Ensure all content is realistic, based on actual locations, and within {budget}.  
- Output must be **raw JSON only** (no markdown, no comments, no extra text).  
- Response must begin with '{' and end with '}'.

`;

export const FestiveTripIdeas = [
  {
    id: 1,
    title: "Varanasi, India",
    festival: "Diwali – festival of Lights",
    Highlights: "Ganga Aarti, thousands of diyas on ghats, fireworks",
    Experience: "Spiritual energy, ancient traditions, river rituals",
    image: require("../assets/images/festive-trips/diwali.jpg"),
  },
  {
    id: 2,
    title: "Mecca, Saudi Arabia",
    festival: "Hajj pilgrimage & Eid al-Adha",
    Highlights:
      "Spiritual pilgrimage, Kaaba rituals, global gathering of Muslims",
    Experience: "Sacred Islamic pilgrimage (for Muslims only)",
    image: require("../assets/images/festive-trips/mecca.jpg"),
  },
  {
    id: 3,
    title: "Jerusalem, Israel",
    festival: "Easter, Passover, Ramadan (multi-faith overlap)",
    Highlights: "Via Dolorosa walk, Western Wall prayers, Iftar meals",
    Experience: "eep historical and religious convergence",
    image: require("../assets/images/festive-trips/jerusalem.jpg"),
  },
  {
    id: 4,
    title: "Amritsar, India",
    festival: " Gurpurab (Guru Nanak’s Birthday)",
    Highlights: "Golden Temple illuminations, kirtans, langar",
    Experience: "Vibrant Sikh hospitality and spiritual depth",
    image: require("../assets/images/festive-trips/amritsar.jpg"),
  },
  {
    id: 5,
    title: "Kathmandu, Nepal",
    festival: "Buddha Jayanti – Birth, Enlightenment, and Death of Buddha",
    Highlights: "Prayers at Swayambhunath & Boudhanath, butter lamps",
    Experience: "Sacred Buddhist sites in full celebration",
    image: require("../assets/images/festive-trips/kathmandu.jpg"),
  },
  {
    id: 6,
    title: "Rio de Janeiro, Brazil",
    festival: "Christmas + New Year",
    Highlights: " Giant tree at Lagoa, beachside midnight masses, fireworks",
    Experience: "Unique warm-weather celebrations and global parties",
    image: require("../assets/images/festive-trips/rio.jpeg"),
  },
  {
    id: 7,
    title: "Pushkar, India",
    festival: "Coincides with Kartik Purnima (Hinduism)",
    Highlights: "Cultural fair, spiritual rituals at Pushkar Lake",
    Experience: "Blend of tradition, livestock fair, and spirituality",
    image: require("../assets/images/festive-trips/pushkar.jpg"),
  },
  {
    id: 8,
    title: "Bangkok, Thailand",
    festival: "Songkran – Thai New Year",
    Highlights: "Water fights, temple rituals, family blessings",
    Experience: "Fun + spiritual new year celebration with Buddhist meaning",
    image: require("../assets/images/festive-trips/songkran.jpg"),
  },
  {
    id: 9,
    title: "Lourdes, France",
    festival: "Feast of the Assumption (Aug 15)",
    Highlights: "Torchlight processions, healing masses",
    Experience: "Major pilgrimage for Catholics",
    image: require("../assets/images/festive-trips/assumption-day.jpg"),
  },
  {
    id: 10,
    title: "Bali, Indonesia",
    festival: "Balinese New Year (Day of Silence)",
    Highlights: "Day-long silence, Ogoh-Ogoh monster parades before Nyepi",
    Experience: "Unique Hindu traditions not found elsewhere",
    image: require("../assets/images/festive-trips/nyepi.jpg"),
  },
];

export const FESTIVE_AI_PROMPT = `
Generate a detailed, budget-conscious festive trip plan for {traveler} visiting {location} during the {festival} festival. The trip is for {totalDays} days and {totalNight} nights, with a budget of {budget}.

IMPORTANT: Ensure the trip captures the cultural essence of the festival, includes related events, avoids peak crowd pitfalls, and offers a safe, enjoyable experience.

Follow these structured instructions:

1. You are a travel data generator.

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
     *Note: Use the exact date provided as input; do not change the year, month, or day.*
   - If transportType = "Train":
     "https://www.makemytrip.com/railways/listing?date={trainDate}&srcStn={FROM_CODE}&srcCity={FROM_CITY}&destStn={TO_CODE}&destCity={TO_CITY}&classCode={CLASS}"
     *Note: Convert the input date to 8-digit format (YYYYMMDD) exactly as given. Do not alter the year or month.*

i. Avoid routes that go in the opposite direction or significantly increase travel time.
j. Keep JSON clean, human-readable, and ready for frontend use.

2. Hotel options (5–6):
   - Must be safe, centrally located, and festival-friendly (easy access to main events or temples).
   - Each hotel must include:
     - hotelName
     - hotelAddress
     - pricePerNight (in ₹)
     - hotelImageURL
     - geoCoordinates
     - rating (0–5)
     - description (mention if it offers views of festival processions, special festive food, etc.)

3. Daily itinerary:
   - Use key "dailyItinerary"
   - Include day1 to day{totalDays}
   - Each day has "places" with 2–3 locations:
     - Include at least 1 place or activity related to the {festival} (e.g., Ganga Aarti for Diwali in Varanasi)
     - placeName
     - placeDetails
     - placeImageURL
     - geoCoordinates
     - ticketPricing (₹)
     - estimatedTravelTime
     - bestTimeToVisit

4. Recommendations:
   - Key: "recommendations"
   - Two arrays: "restaurants" and "localExperiences"
   - Festival-specific experiences must be included, like:
     - Attending a Dussehra parade
     - Visiting a decorated temple
     - Participating in local festive workshops (rangoli, diya painting, garba night, etc.)
   - Each recommendation includes:
     - name
     - description
     - priceRange ("Budget", "Moderate", "High")
     - address or approximateCost

5. Include top-level metadata:
   - "photoReference": short string like "CmRaAAAADiwaliDelhi2023"
   - "tripName": formatted as "City, CountryCode – {festival}"
   - "tripDuration": like "3 days, 2 nights"
   - "budgetCategory": "Budget" (< ₹10,000), "Moderate" (₹10,000–₹25,000), or "Luxury" (> ₹25,000)

Ensure:
- All data is realistic, especially festival-related dates and customs.
- Festival activities must align with {festival} and be verified for timing.
- Include cultural and local flavor.
- Use only valid JSON (start with { and end with }).
`;

export const SportsTypeList = [
  {
    id: 1,
    title: "Football",
    desc: "Explore global football clubs and league matches",
    value: "football",
    image: require("../assets/images/sports-trips/football.jpg"),
  },
  {
    id: 2,
    title: "Cricket",
    desc: "Catch international and league cricket matches",
    value: "cricket",
    image: require("../assets/images/sports-trips/cricket.jpg"),
  },
  {
    id: 3,
    title: "Tennis",
    desc: "Plan trips to Grand Slams and ATP tournaments",
    value: "tennis",
    image: require("../assets/images/sports-trips/tennis.jpg"),
  },
  {
    id: 4,
    title: "Basketball",
    desc: "Attend thrilling NBA and international games",
    value: "basketball",
    image: require("../assets/images/sports-trips/basketball.jpg"),
  },
  {
    id: 5,
    title: "F1 / Racing",
    desc: "Experience the speed of Formula 1 and racing events",
    value: "f1",
    image: require("../assets/images/sports-trips/f1.jpg"),
  },
];

export const MATCH_LOCATION_AI_PROMPT = `
You are an AI assistant helping a {sport} fan plan a trip to attend a live match in 2025. 
Your task is to return ONLY real, confirmed matches from official 2025 competition schedules.

---

Input:
- Team: {team}
- Opponent: {opponent}
- Today's Date: {date}

---

Rules:

1. If "opponent" is not provided or blank → return the next 10 officially scheduled matches for {team} in 2025.
2. If "opponent" is provided → return the next 3 officially scheduled matches between {team} and {opponent}.

---

Strict Requirements:

- Only include matches **strictly after {date}**, and ensure the match date is **≥10 days in the future**.
- All matches must be **within 2025 only**.
- Only use fixtures from **official, confirmed schedules** (e.g. Premier League, Champions League, IPL, NBA, Grand Slams, F1 GP).
- Do NOT fabricate opponents, stadium names, cities, or dates.
- If no confirmed matches exist that satisfy the rules, return an **empty JSON array**: "[]".

---

Output Format:

Respond ONLY in **raw JSON** as an array of matches (max 10).  
Each match must include the following fields exactly:

[
  {
    "matchCity": "City Name",
    "matchDate": "YYYY-MM-DD",
    "stadiumName": "Official Stadium Name",
    "stadiumAddress": "Full Address of Stadium",
    "geoCoordinates": { "lat": number, "lon": number },
    "matchImageURL": "https://official-or-reputable-image-link.jpg",
    "ticketPrice": "$150",
    "opponentTeam": "Opponent Name"
  }
]

---

Validation:

- If unsure or if no verified data exists → return "[]" instead of guessing.
- Always cross-check date, location, and opponent consistency before output.
- The JSON must be valid and start with "[" and end with "]".
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
     - title (place name + state)
     - desc (Short description of why this place is trending now in 20 words.)

3. Respond ONLY in this JSON format:
[
  {
    "id": 1,
    "title": "Place, State",
    "desc": "Short description of why this place is trending now in 20 words."
  }
]
`;
