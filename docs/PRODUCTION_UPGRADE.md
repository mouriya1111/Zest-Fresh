# Zest Fresh Production Upgrade Guide

## What Changed

This upgrade keeps the existing Expo + Express + MongoDB architecture and adds production e-commerce primitives used by premium grocery apps.

## Product Publishing

Products now support:

- `publishStatus`: `Draft`, `Published`, `Hidden`, `Archived`
- `visibleToCustomers`: hides products completely from the customer app
- `availableForSale`: shows products but disables purchase
- `isFeatured`, `isTrending`, `isNewArrival`, `isBestSeller`
- `reservedQuantity`
- `mrp`, `offerPrice`, `discountPercent`
- `ratingAverage`, `ratingCount`, `reviewCount`
- `tags`, `collections`, `subcategory`
- multiple media entries through `media`

Customer APIs only return products that are active, visible, and published. Old products without `publishStatus` are treated as published for backward compatibility.

## Customer Home API

`GET /api/products/home`

Returns:

- `banners`
- `categories`
- `featured`
- `trending`
- `newArrivals`
- `bestSellers`
- `recommended`

The mobile home screen uses this endpoint to render a modern store-front layout.

## Product Search

`GET /api/products`

Supported query params:

- `search`
- `category`
- `brand`
- `tag`
- `available=true`
- `sort=price_asc|price_desc|rating|new`
- `page`
- `limit`

## Owner Controls

The master product screen now supports:

- product publishing status
- customer visibility switch
- available-for-sale switch
- MRP and offer price
- reserved stock
- featured/trending/new-arrival/best-seller flags
- duplicate product
- archive product
- hide product
- weight and volume selling modes

## Inventory

Available stock is now:

```text
totalQuantity - quantitySold - reservedQuantity
```

Inventory screens show total, sold, reserved, and available stock. Weight and volume products are converted into grams/ml/litre for display.

## Checkout Safety

Checkout now rejects:

- draft products
- hidden products
- archived products
- unavailable products
- out-of-stock products

Orders use `effectivePrice`, so offer prices are captured at checkout time.

## Security Hardening

The backend now disables framework fingerprinting and adds baseline security headers:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

For production, add `helmet`, structured validation, audit logs, and request logging aggregation.

## Deployment Checklist

- Use live Razorpay keys only after KYC and webhook setup.
- Never commit `.env`.
- Configure `CORS_ORIGIN` with production domains only.
- Run MongoDB with authentication enabled.
- Use HTTPS everywhere.
- Add backups for MongoDB.
- Configure PM2, Docker, Railway, Render, or another process manager.
- Add monitoring for API errors, payment failures, and low stock alerts.
- Regenerate Razorpay secrets that were shared during development.

## Next Recommended Modules

- Coupon model and checkout discount validation
- Review model with master approval
- Notification model and push/email delivery
- Store settings model for GST, delivery fee, policies, and support contact
- Product detail screen with image gallery and similar products
- Address management screen
- Admin customer management screen
