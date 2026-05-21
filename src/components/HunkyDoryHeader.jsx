import { View, Text, TouchableOpacity } from "react-native";

export default function HunkyDoryHeader({
  label,
  title,
  subtitle,
  bgColor = "#1a1a2e",
  darkMode = false,
  onToggleDarkMode,
  onSignOut,
  children,
}) {
  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 22 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <Text style={{ fontSize: 18 }}>🫂</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginLeft: 5, fontWeight: "700", letterSpacing: 0.5 }}>
              HUNKY DORY
            </Text>
          </View>
          {!!label && (
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{label}</Text>
          )}
          {!!title && (
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff", lineHeight: 28 }}>{title}</Text>
          )}
          {!!subtitle && (
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{subtitle}</Text>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {!!onToggleDarkMode && (
            <TouchableOpacity
              onPress={onToggleDarkMode}
              style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 16 }}>{darkMode ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>
          )}
          {!!onSignOut && (
            <TouchableOpacity
              onPress={onSignOut}
              style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" }}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {children}
    </View>
  );
}
