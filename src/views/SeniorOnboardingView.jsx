import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../AppContext";

export default function SeniorOnboardingView() {
  const { doSeniorAcknowledge, seniorSignOut } = useApp();
  const [checked, setChecked] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#071829" }}>
      <LinearGradient colors={["#071829", "#185FA5"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 52, marginBottom: 16 }}>🫂</Text>
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 12, lineHeight: 38 }}>
            Welcome to Hunky Dory
          </Text>
          <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", textAlign: "center", marginBottom: 36, lineHeight: 26, maxWidth: 300 }}>
            Before you get started, please read the following.
          </Text>

          {/* Disclaimer card */}
          <View style={{ width: "100%", maxWidth: 360, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
            <Text style={{ fontSize: 15, color: "#fff", lineHeight: 26, textAlign: "center" }}>
              Your family carer uses Hunky Dory to check in on you. They can see when you take your medication, eat meals, and respond to check-ins. Your information is only shared with the people you both agree on.{"\n\n"}If someone is setting this up on your behalf, they have confirmed they have your permission or legal authority to do so.
            </Text>
          </View>

          {/* Big checkbox */}
          <TouchableOpacity
            onPress={() => setChecked(v => !v)}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 16, width: "100%", maxWidth: 360, marginBottom: 36 }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 10, borderWidth: 2.5,
              borderColor: checked ? "#fff" : "rgba(255,255,255,0.5)",
              backgroundColor: checked ? "#fff" : "transparent",
              alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
            }}>
              {checked && <Text style={{ fontSize: 22, color: "#071829", fontWeight: "900", lineHeight: 26 }}>✓</Text>}
            </View>
            <Text style={{ flex: 1, fontSize: 16, color: "#fff", lineHeight: 26, fontWeight: "500" }}>
              I understand that medication reminders in Hunky Dory are for personal family use only and do not replace professional medical advice, prescriptions, or clinical care.
            </Text>
          </TouchableOpacity>

          {/* Continue button */}
          <TouchableOpacity
            onPress={doSeniorAcknowledge}
            disabled={!checked}
            style={{
              width: "100%", maxWidth: 360, paddingVertical: 20, borderRadius: 50,
              borderWidth: 2,
              borderColor: checked ? "#F8F9F6" : "rgba(255,255,255,0.25)",
              backgroundColor: checked ? "#F8F9F6" : "rgba(255,255,255,0.1)",
              alignItems: "center", marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: checked ? "#1a1a2e" : "rgba(255,255,255,0.35)" }}>
              Continue →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={seniorSignOut} style={{ paddingVertical: 10 }}>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Sign out</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
