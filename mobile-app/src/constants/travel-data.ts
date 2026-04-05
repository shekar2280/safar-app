import { BudgetTier } from "@/src/types";
import { BudgetOption } from "@/src/types/interfaces";

export const SelectTravelerList = [
  {
    id: 1,
    title: "Just Me",
    desc: "A solo traveler on a personal journey",
    people: "1",
  },
  {
    id: 2,
    title: "Couple",
    desc: "Two people traveling together",
    people: "2",
  },
  {
    id: 3,
    title: "Family",
    desc: "A family trip with parents and kids",
    people: "3 to 5",
  },
  {
    id: 4,
    title: "Friends",
    desc: "A fun trip with friends",
    people: "5 - 10",
  },
] as const;

export const LOCAL_HOTEL_IMAGES: string[] = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630801/hotel_image_1_bjfpsm.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630795/hotel_image_2_eu6fqo.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630795/hotel_image_3_htrimx.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630802/hotel_image_4_c1tvxp.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630800/hotel_image_5_jdt9bj.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1768630795/hotel_fallback_f2pvv2.jpg",
];

export const concertImages: string[] = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766237162/concert-1_qwv2qb.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766237166/concert-2_d2edym.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766237180/concert-3_zwbgrr.jpg",
];

export const fallbackImages: string[] = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/f_auto,q_auto,w_800/v1766143095/fallback_image1_oquhsp.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/f_auto,q_auto,w_800/v1766143097/fallback_image3_mogvf0.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/f_auto,q_auto,w_800/v1766143100/fallback_image2_y6jkri.jpg",
];

export const trendingTripCardImages: string[] = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048386/trending-place4_pi7poy.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048385/trending-place3_lgqnfk.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048384/trending-place1_tkhift.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048383/trending-place2_djbxu7.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770048382/trending-place5_n062ft.jpg",
];

export const RESTAURANT_AND_LOCAL_IMAGES: Record<string, string> = {
  Food: "https://res.cloudinary.com/dbjgmxt8h/image/upload/w_1000,c_limit,f_auto,q_auto/v1769797322/default-food_fnapb2.jpg",
  Experience:
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/w_1000,c_limit,f_auto,q_auto/v1769797318/default-experience_hfbvpe.jpg",
};

export const INDIA_FOOD_COLLECTION: string[] = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726134/thali_mr4ier.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726144/roti_mtjvsm.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726140/biryani_qio38y.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726134/pav_qxp2ln.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726133/dosa_k6vajd.jpg",
];

export const INTL_FOOD_COLLECTION: string[] = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726983/ramen_gjr5ip.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726982/tacos_tz41vf.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726979/hamburger_wqp27v.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726978/pizza_trzxxq.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726976/croissant_ivn0w4.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726134/thali_mr4ier.jpg",
];

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

export const singerOptions = [
  { id: 1, title: "Taylor Swift", image: require("../../assets/images/concert-trips/taylor-swift.jpeg") },
  { id: 2, title: "Weeknd", image: require("../../assets/images/concert-trips/weeknd.jpg") },
  { id: 3, title: "Coldplay", image: require("../../assets/images/concert-trips/coldplay.jpg") },
  { id: 4, title: "Sabrina Carpentar", image: require("../../assets/images/concert-trips/sabrina.jpg") },
  { id: 5, title: "Post Malone", image: require("../../assets/images/concert-trips/post-malone.jpg") },
  { id: 6, title: "Dua Lipa", image: require("../../assets/images/concert-trips/dua.jpg") },
  { id: 7, title: "Ariana Grande", image: require("../../assets/images/concert-trips/ariana-grande.jpg") },
  { id: 8, title: "Bruno Mars", image: require("../../assets/images/concert-trips/bruno-mars.jpeg") },
  { id: 9, title: "Ed Sheeran", image: require("../../assets/images/concert-trips/ed-sheeran.webp") },
  { id: 10, title: "Linkin Park", image: require("../../assets/images/concert-trips/linkin-park.jpeg") },
  { id: 11, title: "Shakira", image: require("../../assets/images/concert-trips/shakira.jpeg") },
  { id: 12, title: "Miley Cyrus", image: require("../../assets/images/concert-trips/miley.jpg") },
  { id: 13, title: "Justin Bieber", image: require("../../assets/images/concert-trips/justin-bieber.jpeg") },
  { id: 14, title: "Maroon 5", image: require("../../assets/images/concert-trips/maroon-5.jpeg") },
  { id: 15, title: "Katy Perry", image: require("../../assets/images/concert-trips/katy-perry.jpeg") },
  { id: 16, title: "Lorde", image: require("../../assets/images/concert-trips/lorde.jpeg") },
];

export const DiscoverIdeasList = [
  {
    id: 1,
    title: "Trending Places",
    desc: "Trending places near you",
    tripCategory: "TRENDING",
    route: "/discover-trip/trending",
    image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933449/trending_zz1svj.png",
  },
  {
    id: 2,
    title: "Hidden Gems",
    desc: "Discover underrated and offbeat destinations",
    tripCategory: "HIDDEN",
    route: "/discover-trip/hidden-gems",
    image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933447/hidden_gems_y5qu3m.webp",
  },
  {
    id: 3,
    title: "Concert Nights",
    desc: "Catch your favorite artists live",
    route: "/discover-trip/concert-trips/select-artist",
    image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933446/concert_pxshln.jpg",
  },
  {
    id: 4,
    title: "Festive Getaways",
    desc: "Trips during local or global festivals",
    tripCategory: "FESTIVE",
    route: "/discover-trip/festive",
    image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764933446/festive_rjm4kc.jpg",
  },
];

export const HiddenGemIdeas = [
  { id: 1, name: "Tawang", title: "Tawang, Arunachal Pradesh", country: "India", countryCode: "in", desc: "Explore serene monasteries and Himalayan landscapes in this remote gem.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232707/tawang_ji5iiy.jpg" },
  { id: 2, name: "Gokarna", title: "Gokarna, Karnataka", country: "India", countryCode: "in", desc: "Unwind at peaceful beaches and ancient temples away from Goa crowds.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232696/gokarna_gktdgn.jpg" },
  { id: 3, name: "Chopta", title: "Chopta, Uttarakhand", country: "India", countryCode: "in", desc: "Trek through alpine meadows to Tungnath, the world's highest Shiva temple.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232695/chopta_grcfgg.jpg" },
  { id: 4, name: "Majuli", title: "Majuli, Assam", country: "India", countryCode: "in", desc: "Visit the world's largest river island with rich culture and monasteries.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232702/majuli_ajibue.jpg" },
  { id: 5, name: "Halebidu", title: "Halebidu, Karnataka", country: "India", countryCode: "in", desc: "Marvel at exquisite Hoysala-era temple carvings and architecture.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/halebidu_kb3oya.jpg" },
  { id: 6, name: "Ziro Valley", title: "Ziro Valley, Arunachal Pradesh", country: "India", countryCode: "in", desc: "Experience Apatani tribal culture amidst rolling hills and rice fields.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232708/ziro_valey_sexmcr.jpg" },
  { id: 7, name: "Mawlynnong", title: "Mawlynnong, Meghalaya", country: "India", countryCode: "in", desc: "Stroll through Asia's cleanest village and see living root bridges.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232704/mawlynnong_j8s0mg.jpg" },
  { id: 8, name: "Patan", title: "Patan, Gujarat", country: "India", countryCode: "in", desc: "Step into history at Rani ki Vav, a beautifully carved stepwell.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232704/patan_pw8wrq.jpg" },
  { id: 9, name: "Lepakshi", title: "Lepakshi, Andhra Pradesh", country: "India", countryCode: "in", desc: "See the hanging pillar and Vijayanagara-style murals at Veerabhadra Temple.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/lepakshi_r99zfu.jpg" },
  { id: 10, name: "Chandratal", title: "Chandratal, Himachal Pradesh", country: "India", countryCode: "in", desc: "Camp by the moon-shaped lake in Spiti for a surreal high-altitude escape.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/chandratal-lake_aisjss.jpg" },
  { id: 11, name: "Hampi", title: "Hampi, Karnataka", country: "India", countryCode: "in", desc: "Walk among the ruins of the Vijayanagara Empire, a UNESCO heritage site.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/hampi_x1s3wg.jpg" },
  { id: 12, name: "Velas", title: "Velas, Maharashtra", country: "India", countryCode: "in", desc: "Witness the Olive Ridley turtle festival in this peaceful Konkan village.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232708/velas_lwm1gg.jpg" },
  { id: 13, name: "Dzukou Valley", title: "Dzukou Valley, Nagaland", country: "India", countryCode: "in", desc: "Trek across lush valleys and seasonal flowers on the Nagaland–Manipur border.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/dzukou_valley_jorfsl.jpg" },
  { id: 14, name: "Chalakudy", title: "Chalakudy, Kerala", country: "India", countryCode: "in", desc: "Discover Athirappilly Falls and lush greenery known as the 'Niagara of India'.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232697/chalakudy_ve3xvo.jpg" },
  { id: 15, name: "Mandu", title: "Mandu, Madhya Pradesh", country: "India", countryCode: "in", desc: "Explore Afghan-style architecture and romantic ruins of this historic fort city.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232703/mandu_rlj3yt.jpg" },
  { id: 16, name: "Khimsar", title: "Khimsar, Rajasthan", country: "India", countryCode: "in", desc: "Stay in a desert fort and experience dunes away from Jaisalmer crowds.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/khimsar_p07v1z.jpg" },
  { id: 17, name: "Tirthan Valley", title: "Tirthan Valley, Himachal Pradesh", country: "India", countryCode: "in", desc: "Relax by rivers and waterfalls in a less commercialized Himalayan valley.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232707/tirthan_grq1vt.jpg" },
  { id: 18, name: "Lonar Crater", title: "Lonar Crater, Maharashtra", country: "India", countryCode: "in", desc: "See a unique lake formed by a meteor impact over 50,000 years ago.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/lonar_hfbcp7.jpg" },
  { id: 19, name: "Araku Valley", title: "Araku Valley, Andhra Pradesh", country: "India", countryCode: "in", desc: "Ride the scenic train and visit tribal coffee plantations in the Eastern Ghats.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232695/araku_aa3dt9.jpg" },
  { id: 20, name: "Kibber", title: "Kibber, Himachal Pradesh", country: "India", countryCode: "in", desc: "Spot snow leopards and visit one of the world's highest inhabited villages.", image: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1766232698/kibber_vgcilh.jpg" },
];

export const HiddenGemsTripImages: Record<string, string> = {
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
};

export const FestiveTripIdeas = [
  { id: 1, name: "Varanasi", title: "Varanasi, India", country: "India", countryCode: "in", festival: "Diwali – festival of Lights", Highlights: "Ganga Aarti, thousands of diyas on ghats, fireworks", Experience: "Spiritual energy, ancient traditions, river rituals", image: require("../../assets/images/festive-trips/diwali.jpg") },
  { id: 2, name: "Mecca", title: "Mecca, Saudi Arabia", country: "Saudi Arabia", countryCode: "sa", festival: "Hajj pilgrimage & Eid al-Adha", Highlights: "Spiritual pilgrimage, Kaaba rituals, global gathering of Muslims", Experience: "Sacred Islamic pilgrimage (for Muslims only)", image: require("../../assets/images/festive-trips/mecca.jpg") },
  { id: 3, name: "Jerusalem", title: "Jerusalem, Israel", country: "Israel", countryCode: "il", festival: "Easter, Passover, Ramadan (multi-faith overlap)", Highlights: "Via Dolorosa walk, Western Wall prayers, Iftar meals", Experience: "Deep historical and religious convergence", image: require("../../assets/images/festive-trips/jerusalem.jpg") },
  { id: 4, name: "Amritsar", title: "Amritsar, India", country: "India", countryCode: "in", festival: "Gurpurab (Guru Nanak's Birthday)", Highlights: "Golden Temple illuminations, kirtans, langar", Experience: "Vibrant Sikh hospitality and spiritual depth", image: require("../../assets/images/festive-trips/amritsar.jpg") },
  { id: 5, name: "Kathmandu", title: "Kathmandu, Nepal", country: "Nepal", countryCode: "np", festival: "Buddha Jayanti – Birth, Enlightenment, and Death of Buddha", Highlights: "Prayers at Swayambhunath & Boudhanath, butter lamps", Experience: "Sacred Buddhist sites in full celebration", image: require("../../assets/images/festive-trips/kathmandu.jpg") },
  { id: 6, name: "Rio de Janeiro", title: "Rio de Janeiro, Brazil", country: "Brazil", countryCode: "br", festival: "Christmas + New Year", Highlights: "Giant tree at Lagoa, beachside midnight masses, fireworks", Experience: "Unique warm-weather celebrations and global parties", image: require("../../assets/images/festive-trips/rio.jpeg") },
  { id: 7, name: "Pushkar", title: "Pushkar, India", country: "India", countryCode: "in", festival: "Coincides with Kartik Purnima (Hinduism)", Highlights: "Cultural fair, spiritual rituals at Pushkar Lake", Experience: "Blend of tradition, livestock fair, and spirituality", image: require("../../assets/images/festive-trips/pushkar.jpg") },
  { id: 8, name: "Bangkok", title: "Bangkok, Thailand", country: "Thailand", countryCode: "th", festival: "Songkran – Thai New Year", Highlights: "Water fights, temple rituals, family blessings", Experience: "Fun + spiritual new year celebration with Buddhist meaning", image: require("../../assets/images/festive-trips/songkran.jpg") },
  { id: 9, name: "Lourdes", title: "Lourdes, France", country: "France", countryCode: "fr", festival: "Feast of the Assumption (Aug 15)", Highlights: "Torchlight processions, healing masses", Experience: "Major pilgrimage for Catholics", image: require("../../assets/images/festive-trips/assumption-day.jpg") },
  { id: 10, name: "Bali", title: "Bali, Indonesia", country: "Indonesia", countryCode: "id", festival: "Balinese New Year (Day of Silence)", Highlights: "Day-long silence, Ogoh-Ogoh monster parades before Nyepi", Experience: "Unique Hindu traditions not found elsewhere", image: require("../../assets/images/festive-trips/nyepi.jpg") },
];

export const TRANSPORT_INSIGHTS_IMAGES = {
  NAVIGATOR: "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775416833/navigator_sagida.jpg",
  WEATHER: "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775416834/weather_kvgpmw.jpg",
} as const;

export const WEATHER_CONFIG = {
  SUNNY: {
    bg: "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775416584/pexels-photo-912364_rjedqj.jpg",
    icon: "sunny",
    color: "#FFD700",
  },
  RAINY: {
    bg: "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775416642/pexels-photo-34250457_zj9xzj.jpg",
    icon: "rainy",
    color: "#60A5FA",
  },
  CLOUDY: {
    bg: "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775416690/pexels-photo-18145805_gt20qa.jpg",
    icon: "cloudy",
    color: "#94A3B8",
  },
  WINTER: {
    bg: "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775416761/pexels-photo-2050601_cmd0sx.jpg",
    icon: "snow",
    color: "#E2E8F0",
  },
} as const;
