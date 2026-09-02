import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const logo = require("../../../assets/zestfresh-logo.png");

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState(null);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function showPopup(title, message, onClose) {
    setPopup({ title, message, onClose });
  }

  function closePopup() {
    const onClose = popup?.onClose;
    setPopup(null);
    onClose?.();
  }

  async function handleRegister() {
    if (!values.name.trim()) {
      showPopup("Name needed", "Please enter your full name.");
      return;
    }

    if (!values.phone.trim()) {
      showPopup("Phone number needed", "Please enter your phone number.");
      return;
    }

    if (!values.password) {
      showPopup("Password needed", "Please enter a password.");
      return;
    }

    try {
      setSubmitting(true);
      await register(values);
      showPopup("Registration successful", "Your account has been created.", () => navigation.navigate("Shop"));
    } catch (error) {
      showPopup("Registration failed", error.message || "Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.backLink} onPress={() => navigation.navigate("Shop")}>Back to Home</Text>
      <View style={styles.brand}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>Taste the freshness</Text>
      </View>
      <Text style={styles.title}>Create your account</Text>
      <TextInput style={styles.input} value={values.name} onChangeText={(text) => setField("name", text)} placeholder="Full name" />
      <TextInput style={styles.input} value={values.email} onChangeText={(text) => setField("email", text)} placeholder="Email" autoCapitalize="none" />
      <TextInput style={styles.input} value={values.phone} onChangeText={(text) => setField("phone", text)} placeholder="Phone" keyboardType="phone-pad" />
      <TextInput style={styles.input} value={values.password} onChangeText={(text) => setField("password", text)} placeholder="Password" secureTextEntry />
      <Button title={submitting ? "Registering..." : "Register"} onPress={handleRegister} disabled={submitting} />
      <Modal transparent visible={Boolean(popup)} animationType="fade" onRequestClose={closePopup}>
        <View style={styles.popupBackdrop}>
          <View style={styles.popupCard}>
            <Text style={styles.popupTitle}>{popup?.title}</Text>
            <Text style={styles.popupMessage}>{popup?.message}</Text>
            <Pressable style={styles.popupButton} onPress={closePopup}>
              <Text style={styles.popupButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 4
  },
  brand: {
    marginBottom: 4
  },
  logo: {
    width: 230,
    height: 128,
    alignSelf: "center"
  },
  tagline: {
    color: colors.muted,
    marginTop: 6,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  backLink: {
    alignSelf: "flex-start",
    color: colors.greenDark,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    fontWeight: "900",
    overflow: "hidden"
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14
  },
  popupBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22
  },
  popupCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 8
  },
  popupMessage: {
    color: colors.muted,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 18
  },
  popupButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  popupButtonText: {
    color: colors.white,
    fontWeight: "900"
  }
});
