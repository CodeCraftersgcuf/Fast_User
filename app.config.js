import 'dotenv/config';

export default {
  expo: {
    name: "Logistics App",
    slug: "logistics-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#9C27B0"
    },
    newArchEnabled: true,
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.deliveryapp",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#9C27B0"
      },
      package: "com.yourcompany.deliveryapp",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    extra: {
      eas: {
        projectId: ""
      },
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  }
}
