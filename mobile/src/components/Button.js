import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function Button({ title, onPress, variant = "primary", style, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "ghost" ? styles.ghost : styles.primary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text style={[styles.text, variant === "ghost" && styles.ghostText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: colors.green
  },
  ghost: {
    backgroundColor: colors.greenSoft
  },
  pressed: {
    opacity: 0.82
  },
  disabled: {
    opacity: 0.5
  },
  text: {
    color: colors.white,
    fontWeight: "800"
  },
  ghostText: {
    color: colors.greenDark
  }
});
