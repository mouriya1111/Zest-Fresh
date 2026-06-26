import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await login(identifier, password);
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.logo}>Zest Fresh</Text>
        <Text style={styles.tagline}>Groceries at your doorstep</Text>
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
    fontSize: 36,
    fontWeight: "900",
    color: colors.greenDark
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
