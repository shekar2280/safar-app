🌍 Safar (सफ़र)
Your AI-Powered Concierge for Authentic Travel
Safar is a premium React Native application built with Expo and Firebase that transforms the way travelers experience new cities. Unlike static itineraries, Safar provides a live, context-aware journey that adapts to your current location and time of day.

✨ Core Features
📅 Intelligent Daily Planner
Optimal Pathing: Automatically sorts your itinerary based on your live GPS location to minimize travel time.

Time-Aware UI: Contextual labels and icons that adapt based on Morning, Afternoon, or Evening modes.

The "Discovery Pool": A clean, categorized feed of sights and local vibes tailored to your destination.

🛵 Contextual Local Experiences
Clubbed Activities: "Experience it here" logic that attaches unique local activities (like renting a scooty or market walking tours) to specific landmarks.

One-Tap Navigation: Deep-linked Google Maps integration that calculates routes directly from your current coordinates.

🍴 Proximity Dining
"Find Eats Nearby": Ditch pre-planned restaurants. Every landmark features a dedicated button to find the best local food within walking distance of where you are right now.

✅ Journey Tracking
Smart Check-ins: Mark sights and experiences as "Visited." Completed items automatically sink to the "Archived" section, keeping your active feed focused and clutter-free.

Cloud Persistence: Your progress is synced to Firestore, ensuring your journey state is preserved across devices.

🛠️ Tech Stack
Frontend: React Native (Expo SDK)

Navigation: Expo Router (File-based routing)

Backend/Database: Firebase Firestore & Authentication

Location Services: Expo Location & Geolib

Icons: Ionicons, Feather, and FontAwesome5

Design System: Premium minimalist aesthetic with soft shadows and Glassmorphism elements.

🚀 Getting Started
Prerequisites
Node.js (v18 or higher)

Expo Go app on your mobile device

Installation
Clone the repository:

Bash
git clone https://github.com/shekar2280/safar-app.git
Install dependencies:

Bash
cd mobile-app
npm install
Set up environment:

Place your google-services.json in the root folder (it is ignored by Git for security).

Create a .env file for your AI API keys.

Start the app:

Bash
npx expo start
🔒 Security
This repository uses strict .gitignore policies to ensure sensitive configuration files (like google-services.json) are never leaked in the version history.

📸 UI Preview
(Optional: You can add screenshots here later)

Planned Route: Minimalist timeline with pulsing active indicators. Discovery Pool: Clean cards with primary actions for navigation and dining.

Safar — Don't just travel, experience.
