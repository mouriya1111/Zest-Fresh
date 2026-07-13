import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
const localApiUrl = Platform.OS === "android" ? "http://10.0.2.2:5050" : "http://127.0.0.1:5050";
const API_URL = (configuredApiUrl || (__DEV__ ? localApiUrl : "")).replace(/\/+$/, "");

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is required for production builds");
}

export async function api(path, options = {}) {
  const token = options.authToken || (await AsyncStorage.getItem("zestFreshToken"));
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const { authToken, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export { API_URL };
