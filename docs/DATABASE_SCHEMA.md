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

## Payment

```js
{
  order: OrderId,
  user: UserId,
  gateway: "razorpay" | "cod",
  gatewayOrderId: String,
  gatewayPaymentId: String,
  gatewaySignature: String,
  amount: Number,
  amountPaise: Number,
  currency: "INR",
  method: "UPI" | "Card" | "NetBanking" | "Wallet" | "EMI" | "COD" | "Unknown",
  status: "Created" | "Pending" | "Authorized" | "Paid" | "Failed" | "Refunded" | "Partially Refunded",
  attempts: Number,
  failureCode: String,
  failureReason: String,
  gatewayPayload: Object,
  verifiedAt: Date,
  paidAt: Date
}
```

## Transaction

```js
{
  order: OrderId,
  payment: PaymentId,
  user: UserId,
  gateway: "razorpay" | "cod",
  gatewayEventId: String,
  gatewayPaymentId: String,
  type: "order_created" | "payment_authorized" | "payment_captured" | "payment_failed" | "refund_created" | "refund_processed" | "refund_failed",
  amount: Number,
  currency: "INR",
  status: String,
  payload: Object,
  occurredAt: Date
}
```

## Refund

```js
{
  order: OrderId,
  payment: PaymentId,
  requestedBy: UserId,
  gatewayRefundId: String,
  amount: Number,
  amountPaise: Number,
  currency: "INR",
  reason: String,
  status: "Requested" | "Processing" | "Processed" | "Failed",
  gatewayPayload: Object,
  processedAt: Date
}
```

## Invoice

```js
{
  invoiceNumber: String,
  order: OrderId,
  payment: PaymentId,
  user: UserId,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  items: [{ name, unit, quantity, price, total }],
  subtotal: Number,
  deliveryFee: Number,
  gstAmount: Number,
  total: Number,
  paymentMethod: String,
  paymentStatus: String,
  currency: "INR",
  issuedAt: Date
}
```

## WebhookEvent

```js
{
  gateway: "razorpay",
  eventId: String,
  eventType: String,
  processed: Boolean,
  payload: Object,
  processedAt: Date,
  error: String
}
```
