import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!identifier.trim() || !password) {
      Alert.alert("Login failed", "Enter email/mobile number and password.");
      return;
    }

    try {
      setLoading(true);
      await login(identifier, password);
      Alert.alert("Login successful", "Login successful");
    } catch (error) {
      Alert.alert("Login failed", error.message || "Network/server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.brand}>
        <Image source={require("../../../assets/zest-fresh-brand.png")} style={styles.logo} resizeMode="contain" accessibilityLabel="Zest Fresh" />
        <Text style={styles.tagline}>Groceries at your doorstep</Text>
      </View>
      <TextInput style={styles.input} value={identifier} onChangeText={setIdentifier} placeholder="Email or phone" autoCapitalize="none" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
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
    width: 250,
    height: 73,
    marginLeft: -10
  },
  tagline: {
    color: colors.muted,
    marginTop: 6
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
