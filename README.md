Safar 🌍 
If You Never Go, You Will Never Know

[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_51-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Sentry](https://img.shields.io/badge/Sentry-Monitored-362D59?logo=sentry&logoColor=white)](https://sentry.io/)

![Safar Hero Banner](./assets/images/hero_banner.png)

Safar is a luxury-tier travel companion that bridges the gap between AI-driven planning and real-world execution. It is a digital concierge that synchronizes your journey, budget, and location into a single, fluid experience.

Experience the App
Intelligent Planning • Financial Control • Discovery

![Planning GIF](./assets/gifs/planning.gif)
![Wallet GIF](./assets/gifs/wallet.gif)
![Discovery GIF](./assets/gifs/discovery.gif)

## ✨ Visual Experience

| Journey Hub | Smart Discovery | Live Sync |
|:---:|:---:|:---:|
| <img src="app%20screenshots/homepage.jpg" width="250" /> | <img src="app%20screenshots/discoverTrips.jpg" width="250" /> | <img src="app%20screenshots/activeTrips.jpg" width="250" /> |

| Financial Hub | Live Itinerary | Traveler Profile |
|:---:|:---:|:---:|
| <img src="app%20screenshots/walletDetail.jpg" width="250" /> | <img src="app%20screenshots/activeTripDetails-1.jpg" width="250" /> | <img src="app%20screenshots/profilePage.jpg" width="250" /> |

## 🏗️ Engineering Architecture

Safar utilizes an event-driven architecture to ensure the UI is always in sync with the cloud. 

1. **The Handshake**: A secure OAuth exchange between Google and Firebase, verified via SHA-1/SHA-256 fingerprints.
2. **The Sync**: Firebase ID tokens are exchanged for custom JWTs via a FastAPI backend, establishing a secure, session-aware link.
3. **The Brain**: Preferences are processed through Google Gemini API, returning structured JSON itineraries.

## 🔒 Security & Reliability

- **CI/CD Integrity**: 100% of sensitive configuration is managed via EAS Secrets.
- **Error Resiliency**: Integrated Sentry hooks capture every native crash and API failure.
- **Data Protection**: Secure storage of session tokens and encrypted communication with the FastAPI gateway.

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo Router, TypeScript, Reanimated, AsyncStorage
- **Backend**: FastAPI (Python), Firebase Auth, PostgreSQL, Redis, Celery
- **AI Engine**: Google Gemini Pro LLM
- **DevOps**: Sentry, EAS (Expo Application Services), Cloudflare Pages (Landing Page)

## 🎨 Design Philosophy

Safar follows a **Glassmorphic Design System**. Every interaction is designed to feel alive with curated HSL color palettes, subtle micro-animations, and skeleton loaders for high perceived performance.

## 👨‍💻 Developed By

**Soma Shekar**
[LinkedIn](https://www.linkedin.com/in/t-somashekar/) • [GitHub](https://github.com/shekar2280) • [Email](mailto:somashekar2025@gmail.com)

---
*Built for the modern explorer. Part of a full-stack ecosystem including mobile, server, and web.*

