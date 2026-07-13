# Authentication Flow

## Customer Registration With OTP

1. Customer enters `name`, `email`, `phone`, and `password`.
2. Mobile calls:

```http
POST /api/auth/register/request-otp
```

3. Backend checks existing accounts before creating anything:

- existing phone with another name -> `This mobile number is already linked to another account.`
- existing phone -> `Mobile number already taken.`
- existing email -> `Email already registered.`

4. If the user is new, backend generates a 6 digit OTP, stores only its SHA-256 hash in `RegistrationOtp`, and expires it after 5 minutes.
5. In development, the OTP is logged and returned as `devOtp` for local testing. The mobile app displays this OTP on the verification screen.
6. In production, configure an SMS provider so OTP reaches the customer phone.
## Real SMS Setup

Local phone delivery will not happen unless an SMS provider is configured.

Fast2SMS:

```env
OTP_SMS_PROVIDER=fast2sms
FAST2SMS_API_KEY=your_fast2sms_key
FAST2SMS_ROUTE=otp
```

Twilio:

```env
OTP_SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=your_twilio_number
TWILIO_COUNTRY_CODE=+91
```

After changing `.env`, restart the backend.

## OTP Verification

Mobile shows the OTP input step and calls:

```http
POST /api/auth/register/verify-otp
```

8. Backend verifies the OTP and only then creates the customer account with `role: "user"`.
9. Mobile shows `Account verified successfully.` and redirects to Login.

## OTP Endpoints

```http
POST /api/auth/register/request-otp
POST /api/auth/register/verify-otp
POST /api/auth/resend-otp
```

All auth errors return popup-friendly JSON:

```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

## Login

Login is unchanged for JWT and role redirects.

```http
POST /api/auth/login
```

Login accepts `identifier` and `password`.

Backend signs a JWT containing:

```js
{
  sub: user._id,
  role: user.role
}
```

Mobile stores the token in AsyncStorage.

`RootNavigator` checks `user.role`:

```text
role = user   -> UserTabs / User Home Screen
role = master -> MasterTabs / Master Dashboard
```

Backend protects routes with:

```js
authenticate
authorize("master")
authorize("user")
```

This keeps customer and owner surfaces separate even if a client attempts to manually open a restricted endpoint.

## Master Account

Master account creation remains manual:

```bash
npm run create-master -- owner@zestfresh.com "StrongPassword123" "Owner"
```
