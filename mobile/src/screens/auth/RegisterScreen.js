import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

function networkMessage(error) {
  return error?.message || "Network/server error";
}

export default function RegisterScreen({ navigation }) {
  const { register, verifyRegisterOtp, resendRegisterOtp } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function registrationPayload() {
    return {
      ...values,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: normalizePhone(values.phone)
    };
  }

  function validateForm() {
    const payload = registrationPayload();

    if (!payload.name || !payload.email || !payload.phone || !payload.password) {
      Alert.alert("Missing details", "Enter name, mobile number, email, and password.");
      return false;
    }

    if (!phoneRegex.test(payload.phone)) {
      Alert.alert("Invalid mobile number", "Enter a valid 10 digit Indian mobile number.");
      return false;
    }

    if (!emailRegex.test(payload.email)) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return false;
    }

    if (payload.password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return false;
    }

    return true;
  }

  async function handleRequestOtp() {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = await register(registrationPayload());
      setDevOtp(data.devOtp || "");
      setOtpRequested(true);
      Alert.alert("OTP sent successfully", data.devOtp ? `OTP sent successfully.\nDev OTP: ${data.devOtp}` : data.message);
    } catch (error) {
      Alert.alert("Registration failed", networkMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp.trim()) {
      Alert.alert("OTP required", "Enter the OTP sent to your mobile or email.");
      return;
    }

    try {
      setVerifying(true);
      const data = await verifyRegisterOtp({
        email: values.email.trim().toLowerCase(),
        phone: normalizePhone(values.phone),
        otp: otp.trim()
      });
      Alert.alert("Account verified successfully", data.message || "Account verified successfully.", [
        { text: "Login", onPress: () => navigation.navigate("Login") }
      ]);
    } catch (error) {
      Alert.alert("OTP verification failed", networkMessage(error));
    } finally {
      setVerifying(false);
    }
  }

  async function handleResendOtp() {
    try {
      setResending(true);
      const data = await resendRegisterOtp({
        email: values.email.trim().toLowerCase(),
        phone: normalizePhone(values.phone)
      });
      setDevOtp(data.devOtp || "");
      Alert.alert("OTP sent successfully", data.devOtp ? `OTP sent successfully.\nDev OTP: ${data.devOtp}` : data.message);
    } catch (error) {
      Alert.alert("Could not resend OTP", networkMessage(error));
    } finally {
      setResending(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.title}>Create your Zest Fresh account</Text>
      <Text style={styles.subtitle}>We verify new accounts with OTP before activation.</Text>

      {!otpRequested ? (
        <>
          <TextInput style={styles.input} value={values.name} onChangeText={(text) => setField("name", text)} placeholder="Full name" />
          <TextInput style={styles.input} value={values.email} onChangeText={(text) => setField("email", text)} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} value={values.phone} onChangeText={(text) => setField("phone", text)} placeholder="Mobile number" keyboardType="phone-pad" maxLength={10} />
          <TextInput style={styles.input} value={values.password} onChangeText={(text) => setField("password", text)} placeholder="Password" secureTextEntry />
          <Button title={loading ? "Sending OTP..." : "Send OTP"} onPress={handleRequestOtp} disabled={loading} />
        </>
      ) : (
        <View style={styles.otpCard}>
          <Text style={styles.otpTitle}>Verify OTP</Text>
          <Text style={styles.otpMeta}>Enter the 6 digit OTP sent to {values.phone || values.email}.</Text>
          {devOtp ? (
            <View style={styles.devOtpBox}>
              <Text style={styles.devOtpLabel}>Development OTP</Text>
              <Text style={styles.devOtpValue}>{devOtp}</Text>
            </View>
          ) : null}
          <TextInput style={styles.input} value={otp} onChangeText={setOtp} placeholder="Enter OTP" keyboardType="number-pad" maxLength={6} />
          <Button title={verifying ? "Verifying..." : "Verify OTP"} onPress={handleVerifyOtp} disabled={verifying} />
          <Button title={resending ? "Resending..." : "Resend OTP"} variant="ghost" onPress={handleResendOtp} disabled={resending} />
          <Button title="Edit details" variant="ghost" onPress={() => setOtpRequested(false)} disabled={verifying || resending} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    gap: 14,
    backgroundColor: colors.surface
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink
  },
  subtitle: {
    color: colors.muted,
    fontWeight: "700",
    marginBottom: 4
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14
  },
  otpCard: {
    gap: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink
  },
  otpMeta: {
    color: colors.muted,
    fontWeight: "700"
  },
  devOtpBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: "#FFF7ED",
    padding: 12
  },
  devOtpLabel: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4
  },
  devOtpValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2
  }
});
