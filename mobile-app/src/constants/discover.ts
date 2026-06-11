export const DiscoverIdeasList = [
  {
    id: 1,
    title: "Trending Places",
    desc: "Explore trending spots globally",
    tripCategory: "TRENDING",
    route: "/discover-trip/trending",
    image: require("../../assets/images/discover/trending.png"),
  },
  {
    id: 2,
    title: "Hidden Gems",
    desc: "Discover underrated and offbeat destinations",
    tripCategory: "HIDDEN",
    route: "/discover-trip/hidden-gems",
    image: require("../../assets/images/discover/hidden_gems.webp"),
  },
  {
    id: 3,
    title: "Concert Nights",
    desc: "Catch your favorite artists live",
    route: "/discover-trip/concert-trips/select-artist",
    image: require("../../assets/images/discover/concert.jpg"),
  },
  {
    id: 4,
    title: "Festive Getaways",
    desc: "Trips during local or global festivals",
    tripCategory: "FESTIVE",
    route: "/discover-trip/festive",
    image: require("../../assets/images/discover/festive.jpg"),
  },
];

export const POPULAR_COUNTRIES_LIST = [
  { name: "Japan", label: "🇯🇵 Japan" },
  { name: "United States", label: "🇺🇸 United States" },
  { name: "Italy", label: "🇮🇹 Italy" },
  { name: "UAE", label: "🇦🇪 UAE" },
  { name: "Thailand", label: "🇹🇭 Thailand" },
  { name: "France", label: "🇫🇷 France" },
  { name: "Indonesia", label: "🇮🇩 Indonesia" },
];

export const CITY_ALIASES: Record<string, string> = {
  "london": "London",
  "mumbai city": "Mumbai",
  "bombay": "Mumbai",
  "new york city": "New York",
  "bengaluru urban": "Bengaluru",
};

export const STORAGE_KEYS = {
  HOME_COUNTRY: "USER_HOME_COUNTRY",
  SELECTED_COUNTRY: "USER_SELECTED_COUNTRY",
};

export const SUGGESTED_OUTBOUND: Record<string, string[]> = {
  US: ["Japan", "Italy", "France", "India", "United Kingdom"],
  IN: ["Japan", "United States", "Thailand", "Vietnam", "UAE"],
  DEFAULT: ["United States", "Japan", "Italy", "France", "Thailand"],
};

export const BACKUPS = ["United Kingdom", "Spain", "Singapore"];

export const COUNTRY_EMOJIS: Record<string, string> = {
  "India": "🇮🇳",
  "United States": "🇺🇸",
  "Japan": "🇯🇵",
  "Italy": "🇮🇹",
  "UAE": "🇦🇪",
  "Thailand": "🇹🇭",
  "France": "🇫🇷",
  "Indonesia": "🇮🇩",
  "United Kingdom": "🇬🇧",
  "UK": "🇬🇧",
  "Vietnam": "🇻🇳",
  "Spain": "🇪🇸",
  "Singapore": "🇸🇬",
};
