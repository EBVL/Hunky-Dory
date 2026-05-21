import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useApp } from "../AppContext";
import { HunkyDoryBanner } from "../components/HunkyDoryHeader";

export default function RoleSelectView() {
  const { setRole, darkMode } = useApp();
  const dm = darkMode;
  const bg = dm ? "#0f172a" : "#EFF4F2";
  const textColor = dm ? "#f1f5f9" : "#1a1a2e";
  const subtext = dm ? "#94a3b8" : "#555";
  const btnBg = dm ? "#1e293b" : "#F8F9F6";
  const btnBorder = dm ? "#94a3b8" : "#1a1a2e";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>

      {/* Top half — hero banner */}
      <View style={{ flex: 2 }}>
        <HunkyDoryBanner bgColor="#185FA5" style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 28 }} />
      </View>

      {/* Bottom — role selection */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View style={{ width: "100%", maxWidth: 380, gap: 16 }}>
          <TouchableOpacity
            onPress={() => setRole("contact")}
            style={{ padding: 24, borderRadius: 20, backgroundColor: btnBg, borderWidth: 2, borderColor: btnBorder, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: dm ? 0.3 : 0.08, shadowRadius: 8, elevation: 4 }}
          >
            <Text style={{ fontSize: 22, fontWeight: "700", color: textColor }}>🫂 I'm the Caregiver</Text>
            <Text style={{ fontSize: 14, fontWeight: "400", marginTop: 4, color: subtext }}>Monitor & stay connected</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRole("senior")}
            style={{ padding: 24, borderRadius: 20, backgroundColor: btnBg, borderWidth: 2, borderColor: btnBorder, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: dm ? 0.3 : 0.08, shadowRadius: 8, elevation: 4 }}
          >
            <Text style={{ fontSize: 22, fontWeight: "700", color: textColor }}>👵 I'm the Senior</Text>
            <Text style={{ fontSize: 14, fontWeight: "400", marginTop: 4, color: subtext }}>Daily check-in & health tracking</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}
