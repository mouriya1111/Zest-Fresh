# Database Schema

## User

```js
{
  name: String,
  email: String,
  phone: String,
  passwordHash: String,
  role: "user" | "master",
  addresses: [{
    label, line1, line2, city, state, postalCode, landmark,
    latitude, longitude, isDefault
  }],
  favorites: [ProductId],
  fcmTokens: [String],
  isOnline: Boolean,
  lastActiveAt: Date,
  lastSeenAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Product

```js
{
  name: String,
  description: String,
  category: String,
  brand: String,
  soldBy: "unit" | "weight",
  weightStepGrams: Number,
  unit: String,
  price: Number, // per unit or per weight step
  mrp: Number,
  imageUrl: String,
  imagePublicId: String,
  totalQuantity: Number,
  quantitySold: Number,
  remainingStock: virtual Number,
  lowStockThreshold: Number,
  isLowStock: virtual Boolean,
  isActive: Boolean
}
```

## Order

```js
{
  user: UserId,
  items: [{
    product: ProductId,
    name: String,
    unit: String,
    quantity: Number,
    price: Number,
    imageUrl: String
  }],
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  status: "Pending" | "Accepted" | "Packed" | "Out for Delivery" | "Delivered" | "Cancelled",
  paymentMethod: "COD" | "UPI" | "Card",
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded",
  paidAt: Date,
  paymentReference: String,
  paymentStatusHistory: [{ status, changedBy, changedAt, reference }],
  deliveryAddress: Object,
  rejectedReason: String,
  statusHistory: [{ status, changedBy, changedAt }]
}
```

## AppMetric

```js
{
  date: Date,
  downloads: Number,
  dailyActiveUsers: Number,
  newRegistrations: Number,
  activeUserIds: [UserId]
}
```
