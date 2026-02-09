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
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630801/hotel_image_1_bjfpsm.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630795/hotel_image_2_eu6fqo.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630795/hotel_image_3_htrimx.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630802/hotel_image_4_c1tvxp.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630800/hotel_image_5_jdt9bj.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630795/hotel_fallback_f2pvv2.jpg",
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
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048386/trending-place4_pi7poy.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048385/trending-place3_lgqnfk.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048384/trending-place1_tkhift.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048383/trending-place2_djbxu7.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048382/trending-place5_n062ft.jpg",
];

export const RESTAURANT_AND_LOCAL_IMAGES = {
  Food: "https://res.cloudinary.com/dbjgmxt8h/image/upload/w_1000,c_limit,f_auto,q_auto/v1769797322/default-food_fnapb2.jpg",
  Experience: "https://res.cloudinary.com/dbjgmxt8h/image/upload/w_1000,c_limit,f_auto,q_auto/v1769797318/default-experience_hfbvpe.jpg"
};

export const singerOptions = [
  {
    id: 1,
    title: "Taylor Swift",
    image: require("../assets/images/concert-trips/taylor-swift.jpeg"),
  },
  {
    id: 2,
    title: "Weeknd",
    image: require("../assets/images/concert-trips/weeknd.jpg"),
  },
  {
    id: 3,
    title: "Coldplay",
    image: require("../assets/images/concert-trips/coldplay.jpg"),
  },
  {
    id: 4,
    title: "Sabrina Carpentar",
    image: require("../assets/images/concert-trips/sabrina.jpg"),
  },
  {
    id: 5,
    title: "Post Malone",
    image: require("../assets/images/concert-trips/post-malone.jpg"),
  },
  {
    id: 6,
    title: "Dua Lipa",
    image: require("../assets/images/concert-trips/dua.jpg"),
  },
  {
    id: 7,
    title: "Ariana Grande",
    image: require("../assets/images/concert-trips/ariana-grande.jpg"),
  },
  {
    id: 8,
    title: "Bruno Mars",
    image: require("../assets/images/concert-trips/bruno-mars.jpeg"),
  },
  {
    id: 9,
    title: "Ed Sheeran",
    image: require("../assets/images/concert-trips/ed-sheeran.webp"),
  },
  {
    id: 10,
    title: "Linkin Park",
    image: require("../assets/images/concert-trips/linkin-park.jpeg"),
  },
  {
    id: 11,
    title: "Shakira",
    image: require("../assets/images/concert-trips/shakira.jpeg"),
  },
  {
    id: 12,
    title: "Miley Cyrus",
    image: require("../assets/images/concert-trips/miley.jpg"),
  },
  {
    id: 13,
    title: "Justin Bieber",
    image: require("../assets/images/concert-trips/justin-bieber.jpeg"),
  },
  {
    id: 14,
    title: "Maroon 5",
    image: require("../assets/images/concert-trips/maroon-5.jpeg"),
  },
  {
    id: 15,
    title: "Katy Perry",
    image: require("../assets/images/concert-trips/katy-perry.jpeg"),
  },
  {
    id: 16,
    title: "Lorde",
    image: require("../assets/images/concert-trips/lorde.jpeg"),
  },
];

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
     *Note: Use the exact date provided as input; do not change the year, month, or day.*
   - If transportType = "Train":
     "https://www.makemytrip.com/railways/listing?date={trainDate}&srcStn={FROM_CODE}&srcCity={FROM_CITY}&destStn={TO_CODE}&destCity={TO_CITY}&classCode={CLASS}"
     *Note: Convert the input date to 8-digit format (YYYYMMDD) exactly as given. Do not alter the year or month.*

i. Avoid routes that go in the opposite direction or significantly increase travel time.
j. Keep JSON clean, human-readable, and ready for frontend use.
`;

export const DiscoverIdeasList = [
  {
    id: 1,
    title: "Trending Places",
    desc: "Trending places near you",
    tripCategory: "TRENDING",
    route: "/discover-trip/trip-manager/select-trending-departure",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933449/trending_zz1svj.png",
  },
  {
    id: 2,
    title: "Hidden Gems ",
    desc: "Discover underrated and offbeat destinations",
    tripCategory: "HIDDEN",
    route: "/discover-trip/trip-manager/select-destination",
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
    tripCategory: "FESTIVE",
    route: "/discover-trip/trip-manager/select-destination",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933446/festive_rjm4kc.jpg",
  },
];

export const HiddenGemIdeas = [
  {
    id: 1,
    name: "Tawang",
    title: "Tawang, Arunachal Pradesh",
    country: "India",
    countryCode: "in",
    desc: "Explore serene monasteries and Himalayan landscapes in this remote gem.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232707/tawang_ji5iiy.jpg",
  },
  {
    id: 2,
    name: "Gokarna",
    title: "Gokarna, Karnataka",
    country: "India",
    countryCode: "in",
    desc: "Unwind at peaceful beaches and ancient temples away from Goa crowds.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232696/gokarna_gktdgn.jpg",
  },
  {
    id: 3,
    name: "Chopta",
    title: "Chopta, Uttarakhand",
    country: "India",
    countryCode: "in",
    desc: "Trek through alpine meadows to Tungnath, the world’s highest Shiva temple.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232695/chopta_grcfgg.jpg",
  },
  {
    id: 4,
    name: "Majuli",
    title: "Majuli, Assam",
    country: "India",
    countryCode: "in",
    desc: "Visit the world’s largest river island with rich culture and monasteries.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232702/majuli_ajibue.jpg",
  },
  {
    id: 5,
    name: "Halebidu",
    title: "Halebidu, Karnataka",
    country: "India",
    countryCode: "in",
    desc: "Marvel at exquisite Hoysala-era temple carvings and architecture.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/halebidu_kb3oya.jpg",
  },
  {
    id: 6,
    name: "Ziro Valley",
    title: "Ziro Valley, Arunachal Pradesh",
    country: "India",
    countryCode: "in",
    desc: "Experience Apatani tribal culture amidst rolling hills and rice fields.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232708/ziro_valey_sexmcr.jpg",
  },
  {
    id: 7,
    name: "Mawlynnong",
    title: "Mawlynnong, Meghalaya",
    country: "India",
    countryCode: "in",
    desc: "Stroll through Asia’s cleanest village and see living root bridges.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232704/mawlynnong_j8s0mg.jpg",
  },
  {
    id: 8,
    name: "Patan",
    title: "Patan, Gujarat",
    country: "India",
    countryCode: "in",
    desc: "Step into history at Rani ki Vav, a beautifully carved stepwell.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232704/patan_pw8wrq.jpg",
  },
  {
    id: 9,
    name: "Lepakshi",
    title: "Lepakshi, Andhra Pradesh",
    country: "India",
    countryCode: "in",
    desc: "See the hanging pillar and Vijayanagara-style murals at Veerabhadra Temple.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/lepakshi_r99zfu.jpg",
  },
  {
    id: 10,
    name: "Chandratal",
    title: "Chandratal, Himachal Pradesh",
    country: "India",
    countryCode: "in",
    desc: "Camp by the moon-shaped lake in Spiti for a surreal high-altitude escape.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/chandratal-lake_aisjss.jpg",
  },
  {
    id: 11,
    name: "Hampi",
    title: "Hampi, Karnataka",
    country: "India",
    countryCode: "in",
    desc: "Walk among the ruins of the Vijayanagara Empire, a UNESCO heritage site.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/hampi_x1s3wg.jpg",
  },
  {
    id: 12,
    name: "Velas",
    title: "Velas, Maharashtra",
    country: "India",
    countryCode: "in",
    desc: "Witness the Olive Ridley turtle festival in this peaceful Konkan village.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232708/velas_lwm1gg.jpg",
  },
  {
    id: 13,
    name: "Dzukou Valley",
    title: "Dzukou Valley, Nagaland",
    country: "India",
    countryCode: "in",
    desc: "Trek across lush valleys and seasonal flowers on the Nagaland–Manipur border.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/dzukou_valley_jorfsl.jpg",
  },
  {
    id: 14,
    name: "Chalakudy",
    title: "Chalakudy, Kerala",
    country: "India",
    countryCode: "in",
    desc: "Discover Athirappilly Falls and lush greenery known as the 'Niagara of India'.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/chalakudy_ve3xvo.jpg",
  },
  {
    id: 15,
    name: "Mandu",
    title: "Mandu, Madhya Pradesh",
    country: "India",
    countryCode: "in",
    desc: "Explore Afghan-style architecture and romantic ruins of this historic fort city.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232703/mandu_rlj3yt.jpg",
  },
  {
    id: 16,
    name: "Khimsar",
    title: "Khimsar, Rajasthan",
    country: "India",
    countryCode: "in",
    desc: "Stay in a desert fort and experience dunes away from Jaisalmer crowds.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/khimsar_p07v1z.jpg",
  },
  {
    id: 17,
    name: "Tirthan Valley",
    title: "Tirthan Valley, Himachal Pradesh",
    country: "India",
    countryCode: "in",
    desc: "Relax by rivers and waterfalls in a less commercialized Himalayan valley.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232707/tirthan_grq1vt.jpg",
  },
  {
    id: 18,
    name: "Lonar Crater",
    title: "Lonar Crater, Maharashtra",
    country: "India",
    countryCode: "in",
    desc: "See a unique lake formed by a meteor impact over 50,000 years ago.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/lonar_hfbcp7.jpg",
  },
  {
    id: 19,
    name: "Araku Valley",
    title: "Araku Valley, Andhra Pradesh",
    country: "India",
    countryCode: "in",
    desc: "Ride the scenic train and visit tribal coffee plantations in the Eastern Ghats.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232695/araku_aa3dt9.jpg",
  },
  {
    id: 20,
    name: "Kibber",
    title: "Kibber, Himachal Pradesh",
    country: "India",
    countryCode: "in",
    desc: "Spot snow leopards and visit one of the world’s highest inhabited villages.",
    image:
      "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/kibber_vgcilh.jpg",
  },
];

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
   - "localExperiences": Provide exactly {totalRecs} unique experiences (e.g., "Pottery session with a local artist", "Night walk through a forgotten district"). Include: experienceName, description, priceRange, approximateCost, and geoCoordinates {"latitude": number, "longitude": number}.

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

export const HiddenGemsTripImages = {
  "Tawang, Arunachal Pradesh":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232707/tawang_ji5iiy.jpg",
  "Gokarna, Karnataka":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232696/gokarna_gktdgn.jpg",
  "Chopta, Uttarakhand":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232695/chopta_grcfgg.jpg",
  "Majuli, Assam":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232702/majuli_ajibue.jpg",
  "Halebidu, Karnataka":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/halebidu_kb3oya.jpg",
  "Ziro Valley, Arunachal Pradesh":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232708/ziro_valey_sexmcr.jpg",
  "Mawlynnong, Meghalaya":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232704/mawlynnong_j8s0mg.jpg",
  "Patan, Gujarat":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232704/patan_pw8wrq.jpg",
  "Lepakshi, Andhra Pradesh":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/lepakshi_r99zfu.jpg",
  "Chandratal, Himachal Pradesh":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/chandratal-lake_aisjss.jpg",
  "Hampi, Karnataka":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/hampi_x1s3wg.jpg",
  "Velas, Maharashtra":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232708/velas_lwm1gg.jpg",
  "Dzukou Valley, Nagaland":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/dzukou_valley_jorfsl.jpg",
  "Chalakudy, Kerala":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/chalakudy_ve3xvo.jpg",
  "Mandu, Madhya Pradesh":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232703/mandu_rlj3yt.jpg",
  "Khimsar, Rajasthan":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/khimsar_p07v1z.jpg",
  "Tirthan Valley, Himachal Pradesh":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232707/tirthan_grq1vt.jpg",
  "Lonar Crater, Maharashtra":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/lonar_hfbcp7.jpg",
  "Araku Valley, Andhra Pradesh":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232695/araku_aa3dt9.jpg",
  "Kibber, Himachal Pradesh":
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/kibber_vgcilh.jpg",
};

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
Generate a detailed, budget-conscious travel plan for {travelers} attending a live concert by {artist} in {location}. 

Travelers depart from {departure} for a fixed duration of 3 days and 2 nights. The budget is {budget}.

- JSON Output Schema (Strict)

1. Transport Metadata (REQUIRED):
   Include these specific fields at the VERY TOP of your JSON response:
   - "departureIata": "3-letter origin code (e.g., BOM)"
   - "destinationIata": "3-letter destination code (e.g., LHR)"

2. Hotel Options (5–6):
   - Must be located near {venueName} or with easy transit to it.
   - Include: hotelName, hotelAddress, pricePerNight (in ₹), hotelImageURL, geoCoordinates {"latitude": number, "longitude": number}, rating (0–5), and a short description.

3. Daily Itinerary (The "Pool" Logic):
   - Use the key "dailyItinerary".
   - Provide a curated collection of activities optimized for a concert weekend.
   - Include exactly 9 "places" objects in a single array under "dailyItinerary".
   - Each "place" must include a field "timeSlot" with values: "Morning", "Afternoon", or "Evening".
   - Ensure there are exactly 3 places for EACH time slot.
   - Crucial: At least 2 of the "Evening" slots must focus on the concert event or pre-concert fan meetups.
   - Each place must include: placeName, placeDetails, placeImageURL, geoCoordinates {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, and timeSlot.

4. Recommendations:
   - Use the key "recommendations".
   - "restaurants": 5 options. Include restaurantName, description, priceRange, address, and approximateCost. Highlight spots popular with concert-goers.
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
 - IMPORTANT: Verify that the "hotelOptions" array objects are fully closed before starting the "dailyItinerary".
 - Double-check that all strings are enclosed in double quotes.

Ensure:
 - All content is realistic and based on actual locations and data.
 - All coordinates and links are valid and sensible.
 - Always return the same JSON structure with stable keys and order.

 Respond ONLY with raw JSON. No markdown, no explanation, no surrounding text. Begin with { and end with }.
`;

export const FestiveTripIdeas = [
  {
    id: 1,
    name: "Varanasi",
    title: "Varanasi, India",
    country: "India",
    countryCode: "in",
    festival: "Diwali – festival of Lights",
    Highlights: "Ganga Aarti, thousands of diyas on ghats, fireworks",
    Experience: "Spiritual energy, ancient traditions, river rituals",
    image: require("../assets/images/festive-trips/diwali.jpg"),
  },
  {
    id: 2,
    name: "Mecca",
    title: "Mecca, Saudi Arabia",
    country: "Saudi Arabia",
    countryCode: "sa",
    festival: "Hajj pilgrimage & Eid al-Adha",
    Highlights: "Spiritual pilgrimage, Kaaba rituals, global gathering of Muslims",
    Experience: "Sacred Islamic pilgrimage (for Muslims only)",
    image: require("../assets/images/festive-trips/mecca.jpg"),
  },
  {
    id: 3,
    name: "Jerusalem",
    title: "Jerusalem, Israel",
    country: "Israel",
    countryCode: "il",
    festival: "Easter, Passover, Ramadan (multi-faith overlap)",
    Highlights: "Via Dolorosa walk, Western Wall prayers, Iftar meals",
    Experience: "Deep historical and religious convergence",
    image: require("../assets/images/festive-trips/jerusalem.jpg"),
  },
  {
    id: 4,
    name: "Amritsar",
    title: "Amritsar, India",
    country: "India",
    countryCode: "in",
    festival: "Gurpurab (Guru Nanak’s Birthday)",
    Highlights: "Golden Temple illuminations, kirtans, langar",
    Experience: "Vibrant Sikh hospitality and spiritual depth",
    image: require("../assets/images/festive-trips/amritsar.jpg"),
  },
  {
    id: 5,
    name: "Kathmandu",
    title: "Kathmandu, Nepal",
    country: "Nepal",
    countryCode: "np",
    festival: "Buddha Jayanti – Birth, Enlightenment, and Death of Buddha",
    Highlights: "Prayers at Swayambhunath & Boudhanath, butter lamps",
    Experience: "Sacred Buddhist sites in full celebration",
    image: require("../assets/images/festive-trips/kathmandu.jpg"),
  },
  {
    id: 6,
    name: "Rio de Janeiro",
    title: "Rio de Janeiro, Brazil",
    country: "Brazil",
    countryCode: "br",
    festival: "Christmas + New Year",
    Highlights: "Giant tree at Lagoa, beachside midnight masses, fireworks",
    Experience: "Unique warm-weather celebrations and global parties",
    image: require("../assets/images/festive-trips/rio.jpeg"),
  },
  {
    id: 7,
    name: "Pushkar",
    title: "Pushkar, India",
    country: "India",
    countryCode: "in",
    festival: "Coincides with Kartik Purnima (Hinduism)",
    Highlights: "Cultural fair, spiritual rituals at Pushkar Lake",
    Experience: "Blend of tradition, livestock fair, and spirituality",
    image: require("../assets/images/festive-trips/pushkar.jpg"),
  },
  {
    id: 8,
    name: "Bangkok",
    title: "Bangkok, Thailand",
    country: "Thailand",
    countryCode: "th",
    festival: "Songkran – Thai New Year",
    Highlights: "Water fights, temple rituals, family blessings",
    Experience: "Fun + spiritual new year celebration with Buddhist meaning",
    image: require("../assets/images/festive-trips/songkran.jpg"),
  },
  {
    id: 9,
    name: "Lourdes",
    title: "Lourdes, France",
    country: "France",
    countryCode: "fr",
    festival: "Feast of the Assumption (Aug 15)",
    Highlights: "Torchlight processions, healing masses",
    Experience: "Major pilgrimage for Catholics",
    image: require("../assets/images/festive-trips/assumption-day.jpg"),
  },
  {
    id: 10,
    name: "Bali",
    title: "Bali, Indonesia",
    country: "Indonesia",
    countryCode: "id",
    festival: "Balinese New Year (Day of Silence)",
    Highlights: "Day-long silence, Ogoh-Ogoh monster parades before Nyepi",
    Experience: "Unique Hindu traditions not found elsewhere",
    image: require("../assets/images/festive-trips/nyepi.jpg"),
  },
];

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
   - At least 50% of these places MUST be related to {festival} (e.g., special markets, pandals, temple events, light shows).
   - Structure: placeName, placeDetails, geoCoordinates: {"latitude": number, "longitude": number}, ticketPricing (in ₹), estimatedTravelTime, bestTimeToVisit, timeSlot.

3. Recommendations:
   - Use the key "recommendations".
   - "restaurants": Provide exactly {totalRecs} authentic restaurants nearby. Include restaurantName, description, priceRange, address, approximateCost, and geoCoordinates. Highlight if they serve special festival cuisine.
   - "localExperiences": Provide exactly {totalRecs} unique experiences related to {festival} (e.g., "Participating in Aarti", "Garba workshop", "Diya lighting ceremony"). Include: experienceName, description, priceRange, approximateCost, and geoCoordinates.

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

export const CITY_TO_IATA = {
  Aalborg: "AAL",
  Aarhus: "AAR",
  Abadan: "ABD",
  Abakan: "ABA",
  Aberdeen: "ABZ",
  Abha: "AHB",
  "Abu Dhabi": "AUH",
  Abidjan: "ABJ",
  Abilene: "ABI",
  Abuja: "ABV",
  Acapulco: "ACA",
  Acarigua: "AGV",
  Accra: "ACC",
  "Adak Island": "ADK",
  Adana: "ADA",
  "Addis Ababa": "ADD",
  Adelaide: "ADL",
  Aden: "ADE",
  Adler: "AER",
  Agadir: "AGA",
  Aguascaliente: "AGU",
  Ahmedabad: "AMD",
  Ajaccio: "AJA",
  Akita: "AXT",
  "Akron/Canton": "CAK",
  "Al-Baha": "ABT",
  "Al-Fujairah": "FJR",
  Albany: "ALB",
  Albuquerque: "ABQ",
  Aleppo: "ALP",
  Alexandria: "ESF",
  Algiers: "ALG",
  Alicante: "ALC",
  Allentown: "ABE",
  "Alma Ata": "ALA",
  "Alor Setar": "AOR",
  Altoona: "AOO",
  Amarillo: "AMA",
  Amman: "AMM",
  Amritsar: "ATQ",
  Amsterdam: "AMS",
  Anchorage: "ANC",
  Ancona: "AOI",
  Andahuaylas: "ANS",
  Anguilla: "AZA",
  Aniak: "ANI",
  Ankara: "ANK",
  Antalya: "AYT",
  Antananarivo: "TNR",
  Antofagasta: "ANF",
  Antwerp: "ANR",
  Aomori: "AOJ",
  Apia: "APW",
  Appleton: "ATW",
  Aqaba: "AQJ",
  Arequipa: "AQP",
  Arica: "ARI",
  Aruba: "AUA",
  Asheville: "AVL",
  Asmara: "ASM",
  Asuncion: "ASU",
  Aswan: "ASW",
  Athens: "ATH",
  Atlanta: "ATL",
  "Atlantic City": "ACY",
  Auckland: "AKL",
  Augusta: "AGS",
  Austin: "AUS",
  Ayacucho: "AYP",
  Baghdad: "BGW",
  Bahrain: "BAH",
  Bakersfield: "BFL",
  "Bali Island": "DPS",
  Baltimore: "BWI",
  Bamako: "BKO",
  "Bandar Abbas": "BND",
  "Bandar Seri Bagawan": "BWN",
  Bangalore: "BLR",
  Bangkok: "BKK",
  Bangor: "BGR",
  Bangui: "BGF",
  Banjul: "BJL",
  Barbados: "BGI",
  Barcelona: "BCN",
  Bari: "BRI",
  Barinas: "BNS",
  Barquisimeto: "BRM",
  Barranquilla: "BAQ",
  Barrow: "BRW",
  Basle: "BSL",
  Basra: "BSR",
  Bastia: "BIA",
  "Baton Rouge": "BTR",
  Beijing: "BJS",
  Beira: "BEW",
  Beirut: "BEY",
  Belem: "BEL",
  Belfast: "BFS",
  Belgrade: "BEG",
  Belize: "BZE",
  Bellingham: "BLI",
  "Belo Horizonte": "BHZ",
  Benghazi: "BEN",
  Bergen: "BGO",
  Berlin: "BER",
  Bermuda: "BDA",
  Bern: "BRN",
  Bethel: "BET",
  Biak: "BIK",
  Biarritz: "BIQ",
  Bilbao: "BIO",
  Billings: "BIL",
  Billund: "BLL",
  Birmingham: "BHM",
  Bissau: "BXO",
  Blantyre: "BLZ",
  Bloemfontein: "BFN",
  Bloomington: "BMI",
  "Boa Vista": "BVB",
  Bodo: "BOO",
  Bogota: "BOG",
  Boise: "BOI",
  Bologna: "BLQ",
  Bombay: "BOM",
  Bordeaux: "BOD",
  Boston: "BOS",
  Bratislava: "BTS",
  Brazzaville: "BZV",
  Bremen: "BRE",
  Brest: "BES",
  Brisbane: "BNE",
  Bristol: "BRS",
  Brussels: "BRU",
  Bucharest: "BUH",
  Budapest: "BUD",
  "Buenos Aires": "BUE",
  Cairo: "CAI",
  Calcutta: "CCU",
  Calgary: "YYC",
  Cali: "CLO",
  Calicut: "CCJ",
  Cancun: "CUN",
  "Cape Town": "CPT",
  Caracas: "CCS",
  Casablanca: "CAS",
  Catania: "СТА",
  Cebu: "CEB",
  Chengdu: "CTU",
  "Chiang Mai": "CNX",
  Chicago: "CHI",
  Cincinnati: "CVG",
  Cleveland: "CLE",
  Cochin: "COK",
  Cologne: "CGN",
  Colombo: "CMB",
  Copenhagen: "CPH",
  Cork: "ORK",
  Dakar: "DKR",
  "Dallas/Ft. Worth": "DFW",
  Damascus: "DAM",
  "Dar Es Salaam": "DAR",
  Darwin: "DRW",
  Delhi: "DEL",
  Denver: "DEN",
  Detroit: "DTT",
  Dhahran: "DHA",
  Dhaka: "DAC",
  Dubai: "DXB",
  Dublin: "DUB",
  Dusseldorf: "DUS",
  Edinburgh: "EDI",
  Edmonton: "YEA",
  Eindhoven: "EIN",
  Florence: "FLR",
  Frankfurt: "FRA",
  Fukuoka: "FUK",
  Geneva: "GVA",
  Genoa: "GOA",
  Glasgow: "GLA",
  Gothenburg: "GOT",
  Guadalajara: "GDL",
  Guangzhou: "CAN",
  "Guatemala City": "GUA",
  Guayaquil: "GYE",
  Halifax: "YHZ",
  Hamburg: "HAM",
  Hanoi: "HAN",
  Hanover: "HAJ",
  Harare: "HRE",
  Helsinki: "HEL",
  "Ho Chi Minh City": "SGN",
  "Hong Kong": "HKG",
  Honolulu: "HNL",
  Houston: "HOU",
  Hyderabad: "HYD",
  Indianapolis: "IND",
  Innsbruck: "INN",
  Islamabad: "ISB",
  Istanbul: "IST",
  Jacksonville: "JAX",
  Jaipur: "JAI",
  Jakarta: "JKT",
  Jeddah: "JED",
  Johannesburg: "JNB",
  Kabul: "KBL",
  Karachi: "KHI",
  Kathmandu: "KTM",
  Kochi: "KCZ",
  "Kuala Lumpur": "KUL",
  Kuwait: "KWI",
  Lagos: "LOS",
  Lahore: "LHE",
  "Las Vegas": "LAS",
  Leipzig: "LEJ",
  Lima: "LIM",
  Lisbon: "LIS",
  Liverpool: "LPL",
  London: "LON",
  "Los Angeles": "LAX",
  Luxembourg: "LUX",
  Lyon: "LYS",
  Madras: "MAA",
  Madrid: "MAD",
  Malaga: "AGP",
  Male: "MLE",
  Manchester: "MAN",
  Manila: "MNL",
  Marseille: "MRS",
  Melbourne: "MEL",
  Memphis: "MEM",
  "Mexico City": "MEX",
  Milan: "MIL",
  Minneapolis: "MSP",
  Montevideo: "MVD",
  Montreal: "YMQ",
  Moscow: "MOW",
  Munich: "MUC",
  Muscat: "MCT",
  Nairobi: "NBO",
  Naples: "NAP",
  Nashville: "BNA",
  Nassau: "NAS",
  "New York": "NYC",
  Nice: "NCE",
  "Oklahoma City": "OKC",
  Orlando: "ORL",
  Osaka: "OSA",
  Oslo: "OSL",
  Ottawa: "YOW",
  Palermo: "PMO",
  Paris: "PAR",
  Perth: "PER",
  Philadelphia: "PHL",
  Phoenix: "PHX",
  Pittsburgh: "PIT",
  Prague: "PRG",
  Quebec: "YQB",
  Rabat: "RBA",
  "Rio de Janeiro": "RIO",
  Riyadh: "RUH",
  Rome: "ROM",
  Sacramento: "SAC",
  "Salt Lake City": "SLC",
  "San Antonio": "SAT",
  "San Diego": "SAN",
  "San Francisco": "SFO",
  "San Jose": "SJC",
  "San Juan": "SJU",
  Santiago: "SCL",
  "Sao Paulo": "SAO",
  Seattle: "SEA",
  Seoul: "SEL",
  Shanghai: "SHA",
  Singapore: "SIN",
  "St. Petersburg": "LED",
  Stockholm: "STO",
  Stuttgart: "STR",
  Sydney: "SYD",
  Taipei: "ΤΡΕ",
  "Tel Aviv Yafo": "TLV",
  Tokyo: "TYO",
  Toronto: "YTO",
  Trivandrum: "TRV",
  Tunis: "TUN",
  Turin: "TRN",
  Vancouver: "YVR",
  Venice: "VCE",
  Vienna: "VIE",
  Warsaw: "WAW",
  Washington: "WAS",
  Wellington: "WLG",
  Winnipeg: "YWG",
  Zurich: "ZRH",

  Delhi: "DEL",
  "New Delhi": "DEL",
  Mumbai: "BOM",
  Bengaluru: "BLR",
  Bangalore: "BLR",
  Hyderabad: "HYD",
  Chennai: "MAA",
  Kolkata: "CCU",
  Ahmedabad: "AMD",
  Kochi: "COK",
  Goa: "GOI",
  Mopa: "GOX",

  // --- Andhra Pradesh ---
  Visakhapatnam: "VTZ",
  Tirupati: "TIR",
  Vijayawada: "VGA",
  Rajahmundry: "RJA",
  Kadapa: "CDP",
  Kurnool: "KJB",

  // --- Arunachal Pradesh ---
  Itanagar: "HGI",
  Pasighat: "IXT",
  Tezu: "TEI",

  // --- Assam ---
  Guwahati: "GAU",
  Dibrugarh: "DIB",
  Silchar: "IXS",
  Jorhat: "JRH",
  Tezpur: "TEZ",
  "North Lakhimpur": "IXI",

  // --- Bihar ---
  Patna: "PAT",
  Gaya: "GAY",
  Darbhanga: "DBR",

  // --- Chandigarh ---
  Chandigarh: "IXC",

  // --- Chhattisgarh ---
  Raipur: "RPR",
  Jagdalpur: "JGB",
  Bilaspur: "PAB",

  // --- Gujarat ---
  Surat: "STV",
  Vadodara: "BDQ",
  Rajkot: "RAJ",
  Bhavnagar: "BHU",
  Jamnagar: "JGA",
  Bhuj: "BHJ",
  Kandla: "IXY",
  Porbandar: "PBD",

  // --- Haryana ---
  Hisar: "HSS",

  // --- Himachal Pradesh ---
  Kullu: "KUU",
  Shimla: "SLV",
  Kangra: "DHM",

  // --- Jammu & Kashmir ---
  Srinagar: "SXR",
  Jammu: "IXJ",

  // --- Jharkhand ---
  Ranchi: "IXR",
  Deoghar: "DGH",
  Jamshedpur: "IXW",

  // --- Karnataka ---
  Mangaluru: "IXE",
  Hubli: "HBX",
  Belgaum: "IXG",
  Mysore: "MYQ",
  Kalaburagi: "GBI",

  // --- Kerala ---
  Thiruvananthapuram: "TRV",
  Kozhikode: "CCJ",
  Kannur: "CNN",

  // --- Ladakh ---
  Leh: "IXL",

  // --- Madhya Pradesh ---
  Indore: "IDR",
  Bhopal: "BHO",
  Gwalior: "GWL",
  Jabalpur: "JLR",
  Khajuraho: "HJR",

  // --- Maharashtra ---
  Pune: "PNQ",
  Nagpur: "NAG",
  Nashik: "ISK",
  Aurangabad: "IXU",
  Shirdi: "SAG",
  Kolhapur: "KLH",
  Nanded: "NDC",

  // --- Manipur ---
  Imphal: "IMF",

  // --- Meghalaya ---
  Shillong: "SHL",

  // --- Mizoram ---
  Aizawl: "AJL",

  // --- Nagaland ---
  Dimapur: "DMU",

  // --- Odisha ---
  Bhubaneswar: "BBI",
  Jharsuguda: "JSA",

  // --- Punjab ---
  Amritsar: "ATQ",
  Bathinda: "BUP",
  Pathankot: "IXP",
  Ludhiana: "LUH",
  Jalandhar: "AIP",

  // --- Rajasthan ---
  Jaipur: "JAI",
  Udaipur: "UDR",
  Jodhpur: "JDH",
  Jaisalmer: "JSA",
  Bikaner: "BKB",
  Ajmer: "KQH",

  // --- Sikkim ---
  Gangtok: "PYG",

  // --- Tamil Nadu ---
  Coimbatore: "CJB",
  Madurai: "IXM",
  Tiruchirappalli: "TRZ",
  Tuticorin: "TCR",
  Salem: "SXV",

  // --- Tripura ---
  Agartala: "IXA",

  // --- Uttar Pradesh ---
  Lucknow: "LKO",
  Varanasi: "VNS",
  Ayodhya: "AYJ",
  Kanpur: "KNU",
  Agra: "AGR",
  Gorakhpur: "GOP",
  Prayagraj: "IXD",
  Bareilly: "BEK",
  Kushinagar: "KJU",
  Noida: "DXN",

  // --- Uttarakhand ---
  Dehradun: "DED",

  // --- West Bengal ---
  Bagdogra: "IXB",
  Siliguri: "IXB",

  // --- UTs ---
  "Port Blair": "IXZ",
  Diu: "DIU",
  Pondicherry: "PNY",
  Agatti: "AGX",
};
