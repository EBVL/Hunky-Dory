import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Switch } from "react-native";
import { useState } from "react";
import { useApp } from "../AppContext";

export default function ContactSignInView() {
  const { contactName, contactLoginPin, doContactLogin, signOut, darkMode, toggleDarkMode } = useApp();
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const dm = darkMode;
  const bg = dm ? "#0f172a" : "#EFF4F2";
  const cardBg = dm ? "#1e293b" : "#F8F9F6";
  const textColor = dm ? "#f1f5f9" : "#1a1a2e";
  const subtext = dm ? "#94a3b8" : "#555";
  const borderColor = dm ? "#334155" : "#1a1a2e";
  const inputBg = dm ? "#0f172a" : "#fff";

  const handleSignIn = () => {
    const ok = doContactLogin(pin, staySignedIn);
    if (!ok) {
      setPinError("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <TouchableOpacity
        onPress={toggleDarkMode}
        style={{ position: "absolute", top: 16, right: 20, backgroundColor: dm ? "#334155" : "rgba(0,0,0,0.08)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
      >
        <Text style={{ fontSize: 18 }}>{dm ? "☀️" : "🌙"}</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 56, marginBottom: 12 }}>🫂</Text>
      <Text style={{ fontSize: 28, fontWeight: "800", color: textColor, textAlign: "center", marginBottom: 4 }}>
        Welcome back!
      </Text>
      <Text style={{ fontSize: 18, color: subtext, textAlign: "center", marginBottom: 48 }}>
        {contactName}
      </Text>

      <View style={{
        width: "100%", maxWidth: 360, backgroundColor: cardBg, borderRadius: 24, padding: 28,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: dm ? 0.3 : 0.08, shadowRadius: 12, elevation: 4,
        borderWidth: dm ? 0 : 1.5, borderColor,
      }}>
        {/* PIN input — only shown if a PIN was set during onboarding */}
        {!!contactLoginPin && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: textColor, marginBottom: 10, textAlign: "center" }}>
              Enter your PIN
            </Text>
            <TextInput
              value={pin}
              onChangeText={(v) => { setPin(v.replace(/\D/g, "").slice(0, 4)); setPinError(""); }}
              placeholder="• • • •"
              placeholderTextColor={subtext}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              onSubmitEditing={handleSignIn}
              style={{
                paddingHorizontal: 22, paddingVertical: 16, borderRadius: 14,
                borderWidth: 1.5, borderColor: pinError ? "#dc2626" : (dm ? "#334155" : "#e5e7eb"),
                fontSize: 28, textAlign: "center", backgroundColor: inputBg,
                color: textColor, letterSpacing: 8,
              }}
            />
            {!!pinError && (
              <Text style={{ fontSize: 13, color: "#dc2626", marginTop: 6, textAlign: "center" }}>{pinError}</Text>
            )}
          </View>
        )}

        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, padding: 16,
          backgroundColor: dm ? "#0f172a" : "#fff",
          borderRadius: 14, borderWidth: 1, borderColor: dm ? "#334155" : "#e5e7eb",
        }}>
          <Text style={{ fontSize: 15, color: textColor, fontWeight: "600" }}>Stay signed in</Text>
          <Switch
            value={staySignedIn}
            onValueChange={setStaySignedIn}
            trackColor={{ false: "#d1d5db", true: "#6d28d9" }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={!!contactLoginPin && pin.length !== 4}
          style={{
            width: "100%", padding: 20, borderRadius: 16, borderWidth: 2,
            borderColor: dm ? "#94a3b8" : "#1a1a2e",
            backgroundColor: (!!contactLoginPin && pin.length !== 4) ? (dm ? "#0f172a" : "#f3f4f6") : (dm ? "#1e293b" : "#F8F9F6"),
            alignItems: "center", marginBottom: 12,
            opacity: (!!contactLoginPin && pin.length !== 4) ? 0.5 : 1,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", color: textColor }}>Sign In 🫂</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={signOut}
          style={{ width: "100%", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: dm ? "#334155" : "#e5e7eb", alignItems: "center" }}
        >
          <Text style={{ fontSize: 15, color: subtext }}>Use a different account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
