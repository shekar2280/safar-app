import "dotenv/config";

export default {
  expo: {
    name: "Safar",
    slug: "safar",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/app_logo.png",
    scheme: "safar",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.shekarsafar.safar",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/images/app_logo.png",
        backgroundColor: "#000000",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "@react-native-google-signin/google-signin",
      "expo-router",
      "expo-font",
      "expo-video",
      "expo-asset",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#000000",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "react-native",
          organization: "safar-gl",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "2420fa32-7cf7-49db-8529-22802ad9c805",
      },
    },
  },
};
