import { api } from "./client";

export function requestRegistrationOtp(payload) {
  return api("/api/auth/register/request-otp", {
    method: "POST",
    body: payload
  });
}

export function verifyRegistrationOtp(payload) {
  return api("/api/auth/register/verify-otp", {
    method: "POST",
    body: payload
  });
}

export function resendRegistrationOtp(payload) {
  return api("/api/auth/resend-otp", {
    method: "POST",
    body: payload
  });
}
