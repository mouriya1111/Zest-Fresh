# Real-Time Online User Tracking

Socket.IO is initialized in `backend/src/server.js` and registered through `backend/src/socket/presence.js`.

## Connection

The React Native app connects with the same JWT used for REST APIs:

```js
io(API_URL, {
  transports: ["websocket"],
  auth: { token }
});
```

## Presence Rooms

Each connected user joins:

```text
user:<userId>
```

Master accounts also join:

```text
masters
```

## Online Count

For customer users, the backend keeps an in-memory map:

```js
Map<userId, Set<socketId>>
```

This prevents double counting when one user opens the app on multiple devices.

On connect:

```text
User.isOnline = true
User.lastActiveAt = now
emit "presence:update" to masters
```

On disconnect:

```text
remove socketId
if user has no active sockets:
  User.isOnline = false
  User.lastSeenAt = now
emit "presence:update" to masters
```

## Order Status Events

When a master updates an order status, the API emits:

```text
order:status
```

to `user:<order.user>`, allowing the customer order history and tracking screen to refresh immediately.
