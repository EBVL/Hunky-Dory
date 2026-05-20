import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { useApp } from "../AppContext";

export default function SeniorSignInView() {
  const { signOut, doSeniorLogin, seniorUsername, seniorPin, darkMode, toggleDarkMode } = useApp();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const dm = darkMode;
  const bg = dm ? "#0f172a" : "#EFF4F2";
  const cardBg = dm ? "#1e293b" : "#F8F9F6";
  const textColor = dm ? "#f1f5f9" : "#1a1a2e";
  const subtext = dm ? "#94a3b8" : "#555";
  const inputBg = dm ? "#0f172a" : "#fff";
  const inputBorder = dm ? "#334155" : "#1a1a2e";

  const handleSignIn = () => {
    if (username.trim().toLowerCase() === seniorUsername && pin.trim() === seniorPin) {
      doSeniorLogin();
    } else {
      setError("Incorrect username or PIN. Check your Hunky Dory setup card.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">

          <TouchableOpacity
            onPress={toggleDarkMode}
            style={{ position: "absolute", top: 16, right: 20, backgroundColor: dm ? "#334155" : "rgba(0,0,0,0.08)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 18 }}>{dm ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 56, marginBottom: 10 }}>🫂</Text>
          <Text style={{ fontSize: 28, fontWeight: "800", color: textColor, textAlign: "center", marginBottom: 6 }}>Hunky Dory</Text>
          <Text style={{ fontSize: 15, color: subtext, textAlign: "center", marginBottom: 36, lineHeight: 24, maxWidth: 300 }}>
            Sign in to connect with your family.
          </Text>

          <View style={{ width: "100%", maxWidth: 360, backgroundColor: cardBg, borderRadius: 24, padding: 28, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: dm ? 0.3 : 0.08, shadowRadius: 12, elevation: 4, borderWidth: dm ? 0 : 1.5, borderColor: "#1a1a2e" }}>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 15, color: textColor, marginBottom: 8, fontWeight: "600" }}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Your username"
                placeholderTextColor={subtext}
                autoCapitalize="none"
                style={{ width: "100%", paddingHorizontal: 18, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: inputBorder, fontSize: 18, backgroundColor: inputBg, color: textColor }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 15, color: textColor, marginBottom: 8, fontWeight: "600" }}>PIN</Text>
              <TextInput
                value={pin}
                onChangeText={setPin}
                placeholder="• • • •"
                placeholderTextColor={subtext}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
                onSubmitEditing={handleSignIn}
                style={{ width: "100%", paddingHorizontal: 18, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: inputBorder, fontSize: 28, backgroundColor: inputBg, color: textColor, letterSpacing: 8 }}
              />
            </View>

            {!!error && (
              <View style={{ padding: 14, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5", borderRadius: 12, marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: "#dc2626", lineHeight: 20 }}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSignIn}
              style={{ width: "100%", padding: 20, borderRadius: 16, borderWidth: 2, borderColor: dm ? "#94a3b8" : "#1a1a2e", backgroundColor: dm ? "#1e293b" : "#F8F9F6", alignItems: "center", marginBottom: 12 }}
            >
              <Text style={{ fontSize: 20, fontWeight: "700", color: textColor }}>Sign In 🫂</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={signOut}
              style={{ width: "100%", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: inputBorder, backgroundColor: "transparent", alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, color: subtext }}>Back</Text>
            </TouchableOpacity>

            {!seniorUsername && (
              <View style={{ marginTop: 20, padding: 16, backgroundColor: dm ? "#1c1a00" : "#fefce8", borderWidth: 1, borderColor: "#fde047", borderRadius: 14 }}>
                <Text style={{ fontSize: 13, color: dm ? "#fde047" : "#854d0e", textAlign: "center", lineHeight: 20 }}>
                  ⚠️ Have your caregiver complete their Hunky Dory setup first — they'll create your username and PIN.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
