import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

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
      <Text style={styles.title}>Create your Zest Fresh account</Text>
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
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: 10
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
