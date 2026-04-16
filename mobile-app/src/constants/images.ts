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

export const TRANSPORT_INSIGHTS_IMAGES = {
  NAVIGATOR:
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775416833/navigator_sagida.jpg",
  WEATHER:
    "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775416834/weather_kvgpmw.jpg",
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

export const LOGO = require("../../assets/images/icon.png");
