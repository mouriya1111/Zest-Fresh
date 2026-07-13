# Razorpay Payments

Zest Fresh supports Cash on Delivery and Razorpay online payments for UPI, cards, net banking, wallets, and EMI.

## Environment

Backend `.env`:

```env
PAYMENT_GATEWAY=razorpay
PAYMENT_CURRENCY=INR
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

Mobile `mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:5050",
      "razorpayKeyId": "rzp_test_xxxxx"
    }
  }
}
```

Only `RAZORPAY_KEY_ID` is exposed to the app. `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` must stay on the backend.

## Test Mode To Live Mode

Use Razorpay test keys while developing. To go live, complete Razorpay KYC and replace the test key ID, key secret, and webhook secret with live values. No code change is required.

## Flow

```text
Cart
  -> choose COD or Razorpay
  -> COD: POST /api/orders
  -> Razorpay: POST /api/payments/create-order
  -> app opens Razorpay Checkout
  -> app sends payment id/order id/signature to POST /api/payments/verify
  -> backend verifies signature and fetches payment from Razorpay
  -> backend marks order paid and creates invoice
  -> webhook acts as backup source of truth
```

## API

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/payments/create-order` | User | Create local order, Razorpay order, and payment record |
| POST | `/api/payments/verify` | User | Verify Razorpay checkout response server-side |
| POST | `/api/payments/retry/:orderId` | User | Retry a failed or pending online payment |
| GET | `/api/payments` | User/Master | Payment history; users see own payments, masters see all |
| GET | `/api/payments/transactions` | User/Master | Transaction ledger |
| POST | `/api/payments/:paymentId/refund` | Master | Initiate Razorpay refund |
| GET | `/api/payments/refunds` | Master | Refund history |
| GET | `/api/payments/invoices/:orderId` | User/Master | Invoice for an order |
| POST | `/api/payments/webhooks/razorpay` | Razorpay | Raw-body webhook endpoint |

## Security

- The frontend never marks an order paid.
- `/api/payments/verify` verifies `razorpay_order_id|razorpay_payment_id` using HMAC SHA256 and `RAZORPAY_KEY_SECRET`.
- `/api/payments/webhooks/razorpay` verifies `X-Razorpay-Signature` using the raw request body and `RAZORPAY_WEBHOOK_SECRET`.
- Webhooks are idempotent using `x-razorpay-event-id`.
- Users can only verify or view their own payments.
- Masters are required for refunds and global payment views.

## Mobile Build Note

`react-native-razorpay` is a native module. Expo Go may not load it. Use a development build or run:

```bash
cd mobile
npm install
npx expo prebuild
npm run android
```

or build with EAS/dev-client for real-device testing.
