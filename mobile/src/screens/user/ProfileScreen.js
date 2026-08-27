import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your account</Text>
        <Text style={styles.section}>Login to manage delivery addresses, favorite items, and account details.</Text>
        <Button title="Login" onPress={() => navigation.navigate("Login")} />
        <Button title="Create account" variant="ghost" onPress={() => navigation.navigate("Register")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.name}</Text>
      <Text style={styles.meta}>{user?.email || user?.phone}</Text>
      <Text style={styles.section}>Delivery addresses and favorite items are backed by the user API.</Text>
      <Button title="Logout" variant="ghost" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: colors.surface
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink
  },
  meta: {
    color: colors.muted
  },
  section: {
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 14
  }
});
