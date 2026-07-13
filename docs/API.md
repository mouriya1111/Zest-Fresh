# API Endpoints

Base URL: `http://localhost:5000`

## Auth

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Customer registration by email or phone |
| POST | `/api/auth/login` | Public | User or master login |
| GET | `/api/auth/me` | Authenticated | Current profile |

Login returns:

```json
{
  "token": "jwt",
  "user": { "role": "user" },
  "redirectTo": "UserHome"
}
```

Master login returns `redirectTo: "MasterDashboard"`.

## Products

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/products` | Public | Browse products |
| GET | `/api/products?search=milk` | Public | Search products |
| GET | `/api/products?category=Dairy` | Public | Category filter |
| POST | `/api/products` | Master | Add item |
| PATCH | `/api/products/:id` | Master | Edit price, details, stock |
| DELETE | `/api/products/:id` | Master | Soft-delete item |
| POST | `/api/products/:id/image` | Master | Upload product image |
| GET | `/api/products/inventory` | Master | Inventory with total, sold, remaining, low-stock status |

## Orders

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/mine` | User | Order history |
| GET | `/api/orders/:id/track` | User | Track order |
| GET | `/api/orders/all` | Master | View all orders |
| PATCH | `/api/orders/:id/status` | Master | Accept, reject, pack, dispatch, deliver, cancel |
| PATCH | `/api/orders/:id/payment` | Master | Confirm payment, mark failure, or record refund |

## Payments

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/payments/create-order` | User | Create a Razorpay order and local payment record |
| POST | `/api/payments/verify` | User | Verify Razorpay payment signature and mark order paid |
| POST | `/api/payments/retry/:orderId` | User | Retry failed or pending online payment |
| GET | `/api/payments` | User/Master | Payment history |
| GET | `/api/payments/transactions` | User/Master | Transaction ledger |
| POST | `/api/payments/:paymentId/refund` | Master | Request refund |
| GET | `/api/payments/refunds` | Master | Refund history |
| GET | `/api/payments/invoices/:orderId` | User/Master | Invoice details |
| POST | `/api/payments/webhooks/razorpay` | Razorpay webhook | Verify and process gateway events |

## Users

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/users/addresses` | User | List delivery addresses |
| POST | `/api/users/addresses` | User | Add delivery address |
| POST | `/api/users/favorites/:productId` | User | Save or remove favorite item |

## Analytics

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/analytics/download` | Public | Increment app download/install metric |
| GET | `/api/analytics/overview` | Master | Users, downloads, online users, DAU, registrations, collected revenue and pending payments |
| GET | `/api/analytics/sales` | Master | Daily sales, monthly sales, best sellers, user growth |

Revenue includes only orders whose `paymentStatus` is `Paid`. Order placement and delivery do not count as payment.
