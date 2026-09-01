import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const logo = require("../../../assets/zestfresh-logo.png");

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const redirectTo = await login(identifier, password);
      if (redirectTo !== "master") {
        navigation.navigate("Shop");
      }
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.backLink} onPress={() => navigation.navigate("Shop")}>Back to Home</Text>
      <View style={styles.brand}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>Taste the freshness</Text>
      </View>
      <TextInput style={styles.input} value={identifier} onChangeText={setIdentifier} placeholder="Email or phone" autoCapitalize="none" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Create customer account" variant="ghost" onPress={() => navigation.navigate("Register")} />
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
  brand: {
    marginBottom: 18
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
