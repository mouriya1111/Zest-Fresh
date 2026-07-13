# Zest Fresh

Zest Fresh is a Blinkit-style grocery delivery app with a React Native mobile frontend and a Node.js, Express, MongoDB backend.

## Project Structure

```text
zest-fresh/
  backend/
    src/
      config/          MongoDB and Cloudinary config
      controllers/     Auth, products, orders, users, analytics
      middleware/      JWT auth, RBAC, error handling
      models/          User, Product, Order, AppMetric schemas
      routes/          REST API routes
      socket/          Socket.IO presence and order events
      utils/           JWT and master-account creation
  mobile/
    src/
      api/             REST and Socket.IO clients
      components/      Shared buttons and product cards
      context/         Auth and cart state
      navigation/      Role-based navigation
      screens/         User and master screens
      theme/           Green and white Zest Fresh theme
  docs/
    API.md
    AUTH_FLOW.md
    DATABASE_SCHEMA.md
    PAYMENTS.md
    REALTIME.md
```

## Setup

```bash
cd /Users/apple/Documents/GITLAB/zest-fresh/backend
cp .env.example .env
npm install
npm run create-master -- owner@zestfresh.com "StrongPassword123" "Owner"
npm run dev
```

Add Razorpay test keys to `backend/.env` before testing online payments:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
PAYMENT_CURRENCY=INR
```

```bash
cd /Users/apple/Documents/GITLAB/zest-fresh/mobile
npm install
npm start
```

For Android emulators, change `mobile/app.json` `extra.apiUrl` to your machine IP or `http://10.0.2.2:5050`.

For Razorpay checkout, also set `mobile/app.json` `extra.razorpayKeyId`. The app uses `react-native-razorpay`, so use a development build/prebuild rather than Expo Go when testing native Razorpay checkout.

## Roles

`role: "user"` users are routed to the customer grocery experience.

`role: "master"` users are routed to the owner dashboard.
