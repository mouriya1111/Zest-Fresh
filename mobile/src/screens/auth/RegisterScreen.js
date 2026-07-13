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
  const { register } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

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

  async function handleRegister() {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await register(registrationPayload());
      Alert.alert("Account created", "Welcome to Zest Fresh.");
    } catch (error) {
      Alert.alert("Registration failed", networkMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.title}>Create your Zest Fresh account</Text>
      <Text style={styles.subtitle}>Create an account to shop and track your orders.</Text>
      <TextInput style={styles.input} value={values.name} onChangeText={(text) => setField("name", text)} placeholder="Full name" />
      <TextInput style={styles.input} value={values.email} onChangeText={(text) => setField("email", text)} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} value={values.phone} onChangeText={(text) => setField("phone", text)} placeholder="Mobile number" keyboardType="phone-pad" maxLength={10} />
      <TextInput style={styles.input} value={values.password} onChangeText={(text) => setField("password", text)} placeholder="Password" secureTextEntry />
      <Button title={loading ? "Creating account..." : "Create account"} onPress={handleRegister} disabled={loading} />
      <Button title="Already have an account" variant="ghost" onPress={() => navigation.navigate("Login")} />
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
