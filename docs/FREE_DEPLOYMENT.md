# Free Deployment Guide

This guide uses free or starter-friendly services:

- MongoDB Atlas Free cluster for the database.
- Render Free Web Service for the backend API.
- Vercel Free project for the web app.
- Cloudinary Free plan only if image upload is added later.

## 1. Create MongoDB Atlas Database

1. Create a free MongoDB Atlas account.
2. Create a free `M0` cluster.
3. Create a database user.
4. Allow network access from anywhere for the first deploy: `0.0.0.0/0`.
5. Copy the connection string.

Use database name:

```text
zest-fresh
```

The final URI should look like:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/zest-fresh
```

## 2. Deploy Backend To Render

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint**.
3. Select this repository.
4. Render will read `render.yaml`.
5. Fill these environment variables:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/zest-fresh
CORS_ORIGIN=https://YOUR_WEB_APP.vercel.app
RAZORPAY_KEY_ID=rzp_test_or_live_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Optional image upload variables:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

After deploy, test:

```text
https://YOUR_RENDER_SERVICE.onrender.com/health
```

You should see:

```json
{ "status": "ok", "app": "Zest Fresh API" }
```

## 3. Create Master Admin User

Open Render shell for the backend service and run:

```bash
npm run create-master -- owner@zestfresh.com StrongPassword123 Owner
```

Change the password before handing over to a client.

## 4. Deploy Web App To Vercel

1. In Vercel, create a new project.
2. Select this repository.
3. Set the project root to:

```text
mobile
```

4. Vercel will use `mobile/vercel.json`.
5. Add this environment variable:

```env
EXPO_PUBLIC_API_URL=https://YOUR_RENDER_SERVICE.onrender.com
```

6. Deploy.

## 5. Build Phone App Later

Before Play Store or App Store builds, set the same production API URL:

```env
EXPO_PUBLIC_API_URL=https://YOUR_RENDER_SERVICE.onrender.com
```

Then build with EAS:

```bash
cd mobile
eas build --platform android
eas build --platform ios
```

## Notes

- Do not use laptop IP addresses like `192.168.x.x` in production.
- Keep `.env` secret. Do not share Razorpay secrets or MongoDB passwords.
- Render free services can sleep when inactive, so the first request may be slow.
