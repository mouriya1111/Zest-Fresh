# Authentication Flow

1. Customer registers with `name`, `password`, and either `email` or `phone`.
2. Backend hashes the password with bcrypt and stores `role: "user"`.
3. Master account is created by the owner with:

```bash
npm run create-master -- owner@zestfresh.com "StrongPassword123" "Owner"
```

4. Login accepts `identifier` and `password`.
5. Backend signs a JWT containing:

```js
{
  sub: user._id,
  role: user.role
}
```

6. Mobile stores the token in AsyncStorage.
7. `RootNavigator` checks `user.role`:

```text
role = user   -> UserTabs / User Home Screen
role = master -> MasterTabs / Master Dashboard
```

8. Backend protects routes with:

```js
authenticate
authorize("master")
authorize("user")
```

This keeps customer and owner surfaces separate even if a client attempts to manually open a restricted endpoint.
