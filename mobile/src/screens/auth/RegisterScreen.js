import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const logo = require("../../../assets/zestfresh-logo.png");

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleRegister() {
    try {
      await register(values);
      navigation.navigate("Shop");
    } catch (error) {
      Alert.alert("Registration failed", error.message);
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
      <Button title="Register" onPress={handleRegister} />
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
  }
});
