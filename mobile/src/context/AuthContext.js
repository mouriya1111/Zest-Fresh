import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import {
  registerDirect,
  requestRegistrationOtp,
  resendRegistrationOtp,
  verifyRegistrationOtp
} from "../api/auth";
import { createSocket } from "../api/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await AsyncStorage.getItem("zestFreshToken");
        const savedUser = await AsyncStorage.getItem("zestFreshUser");

        if (savedToken) {
          const session = await api("/api/auth/me", { authToken: savedToken });
          const restoredUser = session.user || (savedUser ? JSON.parse(savedUser) : null);

          if (!restoredUser) {
            throw new Error("Session user missing");
          }

          await AsyncStorage.setItem("zestFreshUser", JSON.stringify(restoredUser));
          setToken(savedToken);
          setUser(restoredUser);
        }
      } catch (_error) {
        await AsyncStorage.multiRemove(["zestFreshToken", "zestFreshUser"]);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const nextSocket = createSocket(token);
    setSocket(nextSocket);
    const heartbeat = setInterval(() => nextSocket.emit("heartbeat"), 30000);

    return () => {
      clearInterval(heartbeat);
      nextSocket.disconnect();
    };
  }, [token]);

  async function persistSession(payload) {
    await AsyncStorage.setItem("zestFreshToken", payload.token);
    await AsyncStorage.setItem("zestFreshUser", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
    return payload.redirectTo;
  }

  async function login(identifier, password) {
    const redirectTo = await persistSession(await api("/api/auth/login", {
      method: "POST",
      body: { identifier, password }
    }));
    return redirectTo;
  }

  async function register(values) {
    return persistSession(await registerDirect(values));
  }

  async function verifyRegisterOtp(values) {
    return verifyRegistrationOtp(values);
  }

  async function resendRegisterOtp(values) {
    return resendRegistrationOtp(values);
  }

  async function logout() {
    socket?.disconnect();
    await AsyncStorage.multiRemove(["zestFreshToken", "zestFreshUser"]);
    setSocket(null);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, socket, loading, login, register, verifyRegisterOtp, resendRegisterOtp, logout }),
    [token, user, socket, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
