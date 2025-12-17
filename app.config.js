import "dotenv/config";

export default {
  expo: {
    name: "safar",
    slug: "safar",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "safar",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.shekarsafar.safar",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-video",
      "expo-asset",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends."
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      UNSPLASH_API_KEY: process.env.UNSPLASH_API_KEY,
      "OCRSPACE_API_KEY": process.env.OCRSPACE_API_KEY,
      "TICKETMASTER_API_KEY": process.env.TICKETMASTER_API_KEY,
    },
  },
};
