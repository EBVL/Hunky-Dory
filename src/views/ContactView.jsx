import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Modal, Image } from "react-native";
import HunkyDoryHeader from "../components/HunkyDoryHeader";
import { useState, useEffect, useRef } from "react";

const ITEM_H = 52;
const HOURS = [1,2,3,4,5,6,7,8,9,10,11,12];
const MINS = Array.from({ length: 60 }, (_, i) => i);
import { useApp } from "../AppContext";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

const QUICK_MESSAGES = [
  { label: "❤️ I love you!", text: "I love you!" },
  { label: "😊 Thinking of you", text: "Just thinking of you today, have a wonderful day!" },
  { label: "📞 Call me!", text: "Give me a call when you get a chance!" },
  { label: "🌟 You're amazing", text: "You're doing amazing and I'm so proud of you!" },
];

const logColors = {
  checkin: "#16a34a", shower: "#0891b2", medication: "#7c3aed",
  meal: "#d97706", message: "#db2777", sos: "#dc2626",
};

export default function ContactView() {
  const {
    contactSignOut, isPaid, setIsPaid, seniorName, contactName, today,
    isPaired, pairContact,
    checkedInToday, checkInCount, requiredCheckIns, lastCheckIn,
    checkInSchedule, addCheckInTime, removeCheckInTime, completedCheckIns,
    showerStatus, showerDuration, showerInTime,
    medications, deleteMed, saveMed,
    editingMed, setEditingMed,
    showAddMed, setShowAddMed,
    mealCount,
    activityLog,
    sendMessage, customMsg, setCustomMsg,
    contactTab, setContactTab,
    sosAlert, dismissSOS,
    darkMode, toggleDarkMode,
    seniorUsername, seniorPin,
  } = useApp();

  const [medForm, setMedForm] = useState({ name: "", time: "8:00 AM" });
  const [pairUsername, setPairUsername] = useState("");
  const [pairPin, setPairPin] = useState("");
  const [pairError, setPairError] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showInlineMedPicker, setShowInlineMedPicker] = useState(false);
  const [showSeniorPin, setShowSeniorPin] = useState(false);

  const hourScrollRef = useRef(null);
  const minScrollRef = useRef(null);

  useEffect(() => {
    if (showInlineMedPicker) {
      const t = setTimeout(() => {
        hourScrollRef.current?.scrollTo({ y: (tpHour - 1) * ITEM_H, animated: false });
        minScrollRef.current?.scrollTo({ y: tpMin * ITEM_H, animated: false });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [showInlineMedPicker]);

  // Spinner state — shared between both time pickers (only one open at a time)
  const [tpHour, setTpHour] = useState(8);
  const [tpMin, setTpMin] = useState(0);
  const [tpPeriod, setTpPeriod] = useState("AM");

  const fmtTime = () => `${tpHour}:${String(tpMin).padStart(2, "0")} ${tpPeriod}`;

  const initPicker = (timeStr = "8:00 AM") => {
    const [tp, per] = timeStr.split(" ");
    const [h, m] = tp.split(":").map(Number);
    setTpHour(h || 8);
    setTpMin(m || 0);
    setTpPeriod(per || "AM");
  };

  const dm = darkMode;
  const bg = dm ? "#0f172a" : "#EFF4F2";
  const cardBg = dm ? "#1e293b" : "#fff";
  const textColor = dm ? "#f1f5f9" : "#1a1a2e";
  const subtext = dm ? "#94a3b8" : "#888";
  const borderColor = dm ? "#334155" : "#e5e7eb";
  const inputBg = dm ? "#0f172a" : "#fff";

  const card = {
    backgroundColor: cardBg, borderRadius: 20, padding: 22, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: dm ? 0.3 : 0.07, shadowRadius: 6, elevation: 3,
  };
  const sectionLabel = {
    fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: subtext, marginBottom: 14,
  };

  const showerMinutes = showerStatus === "in" && showerInTime
    ? Math.round((new Date() - showerInTime) / 60000) : null;
  const missedCheckIn = !checkedInToday;

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotifEnabled(status === "granted");
    if (status === "granted") {
      await Notifications.scheduleNotificationAsync({
        content: { title: "✅ Notifications enabled", body: `You'll be alerted when ${seniorName} misses a check-in or sends an SOS.` },
        trigger: null,
      });
    }
  };

  const handlePair = () => {
    if (pairContact(pairUsername, pairPin)) {
      setPairError("");
    } else {
      setPairError("Incorrect username or PIN. Ask your family member to check their app.");
    }
  };

  const openEditMed = (med) => { setEditingMed(med); setMedForm({ name: med.name, time: med.time }); setShowInlineMedPicker(false); setShowAddMed(true); };
  const openAddMed = () => { setEditingMed(null); setMedForm({ name: "", time: "8:00 AM" }); setShowInlineMedPicker(false); setShowAddMed(true); };
  const handleSaveMed = () => { if (!medForm.name.trim()) return; saveMed(medForm); setShowInlineMedPicker(false); setShowAddMed(false); };

  // ── Pairing screen ─────────────────────────────────────────────────────────
  if (!isPaired) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: dm ? "#0f172a" : "#EFF4F2" }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 52, marginBottom: 12 }}>🫂</Text>
          <Text style={{ fontSize: 26, fontWeight: "700", color: textColor, textAlign: "center", marginBottom: 8 }}>
            Connect to {seniorName}
          </Text>
          <Text style={{ fontSize: 15, color: subtext, textAlign: "center", marginBottom: 36, lineHeight: 24, maxWidth: 300 }}>
            Ask {seniorName} to share their Username and PIN from the Hunky Dory app.
          </Text>

          <View style={{ width: "100%", maxWidth: 360, backgroundColor: cardBg, borderRadius: 24, padding: 28, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 15, color: textColor, marginBottom: 8, fontWeight: "600" }}>Username</Text>
              <TextInput
                value={pairUsername}
                onChangeText={setPairUsername}
                placeholder="e.g. margaret42"
                placeholderTextColor={subtext}
                autoCapitalize="none"
                style={{ paddingHorizontal: 18, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: borderColor, fontSize: 18, backgroundColor: inputBg, color: textColor }}
              />
            </View>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 15, color: textColor, marginBottom: 8, fontWeight: "600" }}>PIN</Text>
              <TextInput
                value={pairPin}
                onChangeText={setPairPin}
                placeholder="4-digit PIN"
                placeholderTextColor={subtext}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
                onSubmitEditing={handlePair}
                style={{ paddingHorizontal: 18, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: borderColor, fontSize: 24, backgroundColor: inputBg, color: textColor, letterSpacing: 6 }}
              />
            </View>
            {!!pairError && (
              <View style={{ padding: 14, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5", borderRadius: 12, marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: "#dc2626", lineHeight: 20 }}>{pairError}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handlePair}
              style={{ width: "100%", padding: 20, borderRadius: 16, borderWidth: 2, borderColor: "#1a1a2e", backgroundColor: "#F8F9F6", alignItems: "center", marginBottom: 12 }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e" }}>Connect 🫂</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={contactSignOut}
              style={{ width: "100%", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: borderColor, backgroundColor: "transparent", alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, color: subtext }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main dashboard ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>

      {/* SOS Alert modal */}
      <Modal visible={!!sosAlert} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(153,0,0,0.95)", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 80, marginBottom: 16 }}>🚨</Text>
          <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff", marginBottom: 10 }}>HELP ALERT!</Text>
          <Text style={{ fontSize: 22, color: "#fff", marginBottom: 8, fontWeight: "600" }}>{seniorName} needs help!</Text>
          <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 40 }}>Alert sent at {sosAlert?.time}</Text>
          <TouchableOpacity onPress={dismissSOS} style={{ width: "100%", maxWidth: 340, padding: 22, borderRadius: 20, borderWidth: 3, borderColor: "#fff", backgroundColor: "#fff", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#dc2626" }}>✓ I'm On My Way</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={dismissSOS} style={{ width: "100%", maxWidth: 340, padding: 14, borderRadius: 20, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)", backgroundColor: "transparent", alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}>Dismiss Alert</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Medication modal */}
      <Modal visible={showAddMed} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }} onTouchStart={() => { setShowAddMed(false); setShowInlineMedPicker(false); }}>
          <View onTouchStart={e => e.stopPropagation()}>
            <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 28, paddingBottom: 40 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 20, color: textColor }}>{editingMed ? "Edit Medication" : "Add Medication"}</Text>
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 14, color: subtext, marginBottom: 6 }}>Medication Name</Text>
                <TextInput
                  value={medForm.name}
                  onChangeText={(v) => setMedForm((f) => ({ ...f, name: v }))}
                  placeholder="e.g. Metformin 500mg"
                  placeholderTextColor={subtext}
                  style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: borderColor, fontSize: 16, backgroundColor: inputBg, color: textColor }}
                />
              </View>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, color: subtext, marginBottom: 6 }}>Time to Take</Text>
                <TouchableOpacity
                  onPress={() => { initPicker(medForm.time); setShowInlineMedPicker(v => !v); }}
                  style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: borderColor, backgroundColor: inputBg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 16, color: textColor }}>{medForm.time}</Text>
                  <Text style={{ fontSize: 13, color: "#185FA5", fontWeight: "600" }}>{showInlineMedPicker ? "Done ✓" : "Change"}</Text>
                </TouchableOpacity>
                {showInlineMedPicker && (
                  <View style={{ marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: borderColor, backgroundColor: inputBg, overflow: "hidden" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 }}>
                      {/* Hour scroll */}
                      <View style={{ height: ITEM_H * 3, width: 56, overflow: "hidden" }}>
                        <ScrollView
                          ref={hourScrollRef}
                          showsVerticalScrollIndicator={false}
                          snapToInterval={ITEM_H}
                          decelerationRate="fast"
                          onMomentumScrollEnd={e => { const idx = Math.max(0, Math.min(11, Math.round(e.nativeEvent.contentOffset.y / ITEM_H))); setTpHour(HOURS[idx]); }}
                          onScrollEndDrag={e => { const idx = Math.max(0, Math.min(11, Math.round(e.nativeEvent.contentOffset.y / ITEM_H))); setTpHour(HOURS[idx]); }}
                          contentContainerStyle={{ paddingVertical: ITEM_H }}
                        >
                          {HOURS.map(h => (
                            <View key={h} style={{ height: ITEM_H, alignItems: "center", justifyContent: "center" }}>
                              <Text style={{ fontSize: 28, fontWeight: "700", color: textColor }}>{h}</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                      <Text style={{ fontSize: 28, fontWeight: "800", color: textColor, marginHorizontal: 4 }}>:</Text>
                      {/* Minute scroll */}
                      <View style={{ height: ITEM_H * 3, width: 64, overflow: "hidden" }}>
                        <ScrollView
                          ref={minScrollRef}
                          showsVerticalScrollIndicator={false}
                          snapToInterval={ITEM_H}
                          decelerationRate="fast"
                          onMomentumScrollEnd={e => { const idx = Math.max(0, Math.min(59, Math.round(e.nativeEvent.contentOffset.y / ITEM_H))); setTpMin(MINS[idx]); }}
                          onScrollEndDrag={e => { const idx = Math.max(0, Math.min(59, Math.round(e.nativeEvent.contentOffset.y / ITEM_H))); setTpMin(MINS[idx]); }}
                          contentContainerStyle={{ paddingVertical: ITEM_H }}
                        >
                          {MINS.map(m => (
                            <View key={m} style={{ height: ITEM_H, alignItems: "center", justifyContent: "center" }}>
                              <Text style={{ fontSize: 28, fontWeight: "700", color: textColor }}>{String(m).padStart(2, "0")}</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                      {/* AM/PM */}
                      <TouchableOpacity
                        onPress={() => setTpPeriod(p => p === "AM" ? "PM" : "AM")}
                        style={{ marginLeft: 12, backgroundColor: "#185FA5", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>{tpPeriod}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => { setMedForm(f => ({ ...f, time: fmtTime() })); setShowInlineMedPicker(false); }}
                      style={{ margin: 12, marginTop: 4, padding: 14, borderRadius: 50, borderWidth: 2, borderColor: "#1a1a2e", backgroundColor: dm ? "#1e293b" : "#F8F9F6", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>Set {tpHour}:{String(tpMin).padStart(2, "0")} {tpPeriod} →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={() => setShowAddMed(false)} style={{ flex: 1, padding: 14, borderRadius: 50, borderWidth: 1, borderColor: borderColor, backgroundColor: dm ? "#0f172a" : "#f9f9f9", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, color: subtext }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveMed} style={{ flex: 2, padding: 14, borderRadius: 50, borderWidth: 2, borderColor: "#1a1a2e", backgroundColor: dm ? "#1e293b" : "#F8F9F6", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>{editingMed ? "Save Changes" : "Add Medication"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time picker for check-in schedule */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <TouchableOpacity activeOpacity={1} onPress={() => setShowTimePicker(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 24, paddingBottom: 40 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: textColor, marginBottom: 4, textAlign: "center" }}>Add Check-In Time</Text>
              <Text style={{ fontSize: 13, color: subtext, textAlign: "center", marginBottom: 20 }}>Tap ▲ ▼ to change • tap AM/PM to switch</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {/* Hour */}
                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity onPress={() => setTpHour(h => h === 12 ? 1 : h + 1)} style={{ padding: 12 }}>
                    <Text style={{ fontSize: 22, color: "#185FA5" }}>▲</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 42, fontWeight: "800", color: textColor, width: 58, textAlign: "center" }}>{tpHour}</Text>
                  <TouchableOpacity onPress={() => setTpHour(h => h === 1 ? 12 : h - 1)} style={{ padding: 12 }}>
                    <Text style={{ fontSize: 22, color: "#185FA5" }}>▼</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 42, fontWeight: "800", color: textColor, marginBottom: 2 }}>:</Text>
                {/* Minute */}
                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity onPress={() => setTpMin(m => (m + 1) % 60)} style={{ padding: 12 }}>
                    <Text style={{ fontSize: 22, color: "#185FA5" }}>▲</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 42, fontWeight: "800", color: textColor, width: 58, textAlign: "center" }}>{String(tpMin).padStart(2, "0")}</Text>
                  <TouchableOpacity onPress={() => setTpMin(m => m === 0 ? 59 : m - 1)} style={{ padding: 12 }}>
                    <Text style={{ fontSize: 22, color: "#185FA5" }}>▼</Text>
                  </TouchableOpacity>
                </View>
                {/* AM/PM */}
                <TouchableOpacity
                  onPress={() => setTpPeriod(p => p === "AM" ? "PM" : "AM")}
                  style={{ marginLeft: 10, backgroundColor: "#185FA5", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff" }}>{tpPeriod}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)} style={{ flex: 1, padding: 14, borderRadius: 50, borderWidth: 1, borderColor: borderColor, backgroundColor: dm ? "#0f172a" : "#f9f9f9", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, color: subtext }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { addCheckInTime(fmtTime()); setShowTimePicker(false); }}
                  style={{ flex: 2, padding: 14, borderRadius: 50, borderWidth: 2, borderColor: "#1a1a2e", backgroundColor: dm ? "#1e293b" : "#F8F9F6", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>Add {tpHour}:{String(tpMin).padStart(2,"0")} {tpPeriod} →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <HunkyDoryHeader
        title={`Hi ${contactName} 👋`}
        subtitle={`Watching over ${seniorName}`}
        bgColor="#185FA5"
        onSignOut={contactSignOut}
      >
        {missedCheckIn ? (
          <View style={{ marginTop: 16, padding: 14, backgroundColor: "rgba(220,38,38,0.25)", borderWidth: 1, borderColor: "rgba(220,38,38,0.4)", borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 22 }}>⚠️</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#fca5a5" }}>
                {requiredCheckIns > 0 ? `${checkInCount}/${requiredCheckIns} check-ins done today` : "No check-in yet today"}
              </Text>
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Consider reaching out to {seniorName}</Text>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 16, padding: 12, backgroundColor: "rgba(22,163,74,0.2)", borderWidth: 1, borderColor: "rgba(22,163,74,0.4)", borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 20 }}>✅</Text>
            <Text style={{ fontSize: 14, color: "#86efac" }}>
              {requiredCheckIns > 1 ? `${seniorName} — all ${requiredCheckIns} check-ins done!` : `${seniorName} checked in at ${lastCheckIn}`}
            </Text>
          </View>
        )}
      </HunkyDoryHeader>

      {/* Tabs */}
      <View style={{ flexDirection: "row", backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: borderColor }}>
        {["dashboard", "medications", "messages"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setContactTab(t)} style={{ flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 3, borderBottomColor: contactTab === t ? "#7c3aed" : "transparent" }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: contactTab === t ? "#7c3aed" : subtext }}>
              {t === "dashboard" ? "📊 Dashboard" : t === "medications" ? "💊 Meds" : "💌 Messages"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* ── Dashboard tab ── */}
        {contactTab === "dashboard" && (
          <View>
            {!isPaid && (
              <View style={{ ...card, backgroundColor: dm ? "#1c1a00" : "#fefce8", borderWidth: 1, borderColor: "#fde047" }}>
                <Text style={{ fontSize: 19, color: textColor, marginBottom: 8 }}>✦ Upgrade to Premium</Text>
                <Text style={{ fontSize: 14, color: subtext, lineHeight: 22, marginBottom: 14 }}>
                  Unlock shower safety, medication tracking, and meal monitoring for {seniorName}.
                </Text>
                <TouchableOpacity onPress={() => setIsPaid(true)} style={{ paddingHorizontal: 28, paddingVertical: 14, borderRadius: 50, borderWidth: 2, borderColor: "#1a1a2e", backgroundColor: "#F8F9F6", alignSelf: "flex-start" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e" }}>Activate Premium →</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={card}>
              <Text style={sectionLabel}>Notifications</Text>
              {notifEnabled ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: dm ? "#14532d" : "#f0fdf4", borderRadius: 12, borderWidth: 1, borderColor: "#bbf7d0" }}>
                  <Text style={{ fontSize: 22 }}>🔔</Text>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#15803d" }}>Notifications active</Text>
                    <Text style={{ fontSize: 13, color: subtext }}>You'll be alerted for SOS and missed check-ins</Text>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={{ fontSize: 14, color: subtext, marginBottom: 12, lineHeight: 22 }}>
                    Get alerted when {seniorName} misses a check-in or sends an SOS.
                  </Text>
                  <TouchableOpacity onPress={requestNotifications} style={{ width: "100%", padding: 16, borderRadius: 50, borderWidth: 2, borderColor: "#1a1a2e", backgroundColor: dm ? "#1e293b" : "#F8F9F6", alignItems: "center" }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>🔔 Enable Notifications</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={card}>
              <Text style={sectionLabel}>Check-In Schedule</Text>
              {checkInSchedule.length === 0 ? (
                <Text style={{ fontSize: 14, color: subtext, marginBottom: 14 }}>No schedule set — {seniorName} can check in any time.</Text>
              ) : (
                <View style={{ gap: 8, marginBottom: 14 }}>
                  {checkInSchedule.map((t) => {
                    const done = completedCheckIns.includes(t);
                    return (
                      <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, backgroundColor: done ? (dm ? "#14532d" : "#f0fdf4") : (dm ? "#0f172a" : "#f9fafb"), borderWidth: 1, borderColor: done ? "#bbf7d0" : borderColor }}>
                        <Text style={{ fontSize: 18 }}>{done ? "✅" : "⏰"}</Text>
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: done ? "#15803d" : textColor }}>{t}</Text>
                        <Text style={{ fontSize: 13, color: done ? "#16a34a" : subtext, marginRight: 8 }}>{done ? "Done" : "Pending"}</Text>
                        <TouchableOpacity onPress={() => removeCheckInTime(t)} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: "#fca5a5", backgroundColor: dm ? "#450a0a" : "#fff" }}>
                          <Text style={{ color: "#dc2626", fontSize: 13 }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
              <TouchableOpacity onPress={() => { initPicker("8:00 AM"); setShowTimePicker(true); }} style={{ width: "100%", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: borderColor, backgroundColor: dm ? "#1e293b" : "#F8F9F6", alignItems: "center" }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>+ Add Check-In Time</Text>
              </TouchableOpacity>
            </View>

            {/* 2×2 status grid */}
            <View style={{ gap: 12, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1, ...card, margin: 0, marginBottom: 0, padding: 14, borderLeftWidth: 4, borderLeftColor: checkedInToday ? "#16a34a" : "#dc2626" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: subtext, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Check-In</Text>
                  <Text style={{ fontSize: 26 }}>{checkedInToday ? "✅" : "❓"}</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: checkedInToday ? "#16a34a" : "#dc2626", marginTop: 4 }}>
                    {checkedInToday ? lastCheckIn : `${checkInCount}/${Math.max(requiredCheckIns, 1)}`}
                  </Text>
                </View>
                <View style={{ flex: 1, ...card, margin: 0, marginBottom: 0, padding: 14, borderLeftWidth: 4, borderLeftColor: isPaid ? (showerStatus === "in" ? "#0891b2" : showerStatus === "out" ? "#16a34a" : borderColor) : borderColor }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: subtext, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Shower</Text>
                  <Text style={{ fontSize: 26 }}>🚿</Text>
                  {isPaid ? (
                    <Text style={{ fontSize: 12, fontWeight: "600", marginTop: 4, color: showerStatus === "in" ? "#0891b2" : showerStatus === "out" ? "#16a34a" : subtext }}>
                      {showerStatus === "in" ? `In shower${showerMinutes !== null ? ` · ${showerMinutes}m` : ""}` : showerStatus === "out" ? `Done${showerDuration ? ` · ${showerDuration}m` : ""}` : "No activity"}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 11, color: subtext, marginTop: 4 }}>Premium</Text>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1, ...card, margin: 0, marginBottom: 0, padding: 14, borderLeftWidth: 4, borderLeftColor: "#7c3aed" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: subtext, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Meds</Text>
                  <Text style={{ fontSize: 26 }}>💊</Text>
                  {isPaid ? (
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#7c3aed", marginTop: 4 }}>{medications.filter((m) => m.taken).length}/{medications.length} taken</Text>
                  ) : (
                    <Text style={{ fontSize: 11, color: subtext, marginTop: 4 }}>Premium</Text>
                  )}
                </View>
                <View style={{ flex: 1, ...card, margin: 0, marginBottom: 0, padding: 14, borderLeftWidth: 4, borderLeftColor: "#d97706" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: subtext, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Meals</Text>
                  <Text style={{ fontSize: 26 }}>🍽️</Text>
                  {isPaid ? (
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#d97706", marginTop: 4 }}>{mealCount} meal{mealCount !== 1 ? "s" : ""} today</Text>
                  ) : (
                    <Text style={{ fontSize: 11, color: subtext, marginTop: 4 }}>Premium</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Senior login info */}
            <View style={card}>
              <Text style={sectionLabel}>{seniorName}'s Login Info</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: subtext }}>Username</Text>
                <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>{seniorUsername}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: subtext }}>PIN</Text>
                <TouchableOpacity onPress={() => setShowSeniorPin(v => !v)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: textColor, letterSpacing: showSeniorPin ? 1 : 6 }}>
                    {showSeniorPin ? seniorPin : "••••"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#3B82F6", fontWeight: "600" }}>{showSeniorPin ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Activity log */}
            <View style={card}>
              <Text style={sectionLabel}>Activity Log</Text>
              {activityLog.length === 0 ? (
                <Text style={{ textAlign: "center", color: subtext, fontSize: 15, paddingVertical: 16 }}>No activity yet today.</Text>
              ) : (
                <View>
                  {activityLog.map((entry, i) => (
                    <View key={entry.id} style={{ flexDirection: "row", gap: 14, paddingBottom: i < activityLog.length - 1 ? 14 : 0, marginBottom: i < activityLog.length - 1 ? 14 : 0, borderBottomWidth: i < activityLog.length - 1 ? 1 : 0, borderBottomColor: borderColor }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${logColors[entry.type] || "#888"}22`, borderWidth: 1, borderColor: `${logColors[entry.type] || "#888"}44`, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 16 }}>{entry.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, color: textColor, lineHeight: 20 }}>{entry.text}</Text>
                        <Text style={{ fontSize: 12, color: subtext, marginTop: 2 }}>{entry.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </View>
        )}

        {/* ── Medications tab ── */}
        {contactTab === "medications" && (
          <View>
            <View style={{ padding: 16, backgroundColor: dm ? "#1e1a00" : "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 14, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: dm ? "#fcd34d" : "#92400e", lineHeight: 21 }}>
                Medication reminders are for family coordination only. Always follow the instructions of your loved one's doctor or pharmacist. Hunky Dory is not a medical service and does not provide clinical or professional healthcare advice.
              </Text>
            </View>
            <View style={card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={sectionLabel}>{seniorName}'s Medications</Text>
                <TouchableOpacity onPress={openAddMed} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: "#1a1a2e", backgroundColor: dm ? "#1e293b" : "#F8F9F6" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: textColor }}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {medications.length === 0 ? (
                <Text style={{ textAlign: "center", color: subtext, fontSize: 15, paddingVertical: 20 }}>No medications added yet.</Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {medications.map((med) => (
                    <View key={med.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, backgroundColor: dm ? "#0f172a" : "#f9fafb", borderWidth: 1, borderColor: borderColor }}>
                      <Text style={{ fontSize: 22 }}>💊</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: "600", color: textColor }}>{med.name}</Text>
                        <Text style={{ fontSize: 13, color: subtext, marginTop: 2 }}>Daily at {med.time}</Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity onPress={() => openEditMed(med)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: borderColor, backgroundColor: dm ? "#1e293b" : "#fff" }}>
                          <Text style={{ fontSize: 13, color: textColor }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteMed(med.id)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#fca5a5", backgroundColor: dm ? "#450a0a" : "#fff" }}>
                          <Text style={{ fontSize: 13, color: "#dc2626" }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={{ padding: 14, backgroundColor: dm ? "#14532d" : "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 14 }}>
              <Text style={{ fontSize: 14, color: "#15803d", lineHeight: 22 }}>
                💡 Changes show immediately on {seniorName}'s check-in screen.
              </Text>
            </View>
          </View>
        )}

        {/* ── Messages tab ── */}
        {contactTab === "messages" && (
          <View style={card}>
            <Text style={sectionLabel}>Quick Messages</Text>
            <Text style={{ fontSize: 14, color: subtext, marginBottom: 16, lineHeight: 22 }}>
              Send a pop-up message to {seniorName}'s screen right now.
            </Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {QUICK_MESSAGES.map((qm) => (
                <TouchableOpacity
                  key={qm.label}
                  onPress={() => sendMessage(qm.text)}
                  style={{ padding: 16, borderRadius: 14, borderWidth: 1, borderColor: borderColor, backgroundColor: dm ? "#0f172a" : "#fafafa" }}
                >
                  <Text style={{ fontSize: 16, color: textColor, fontWeight: "500" }}>{qm.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: subtext, marginBottom: 10 }}>Custom Message</Text>
              <TextInput
                value={customMsg}
                onChangeText={setCustomMsg}
                placeholder={`Type a personal message to ${seniorName}...`}
                placeholderTextColor={subtext}
                multiline
                numberOfLines={3}
                style={{ padding: 16, borderRadius: 14, borderWidth: 1, borderColor: borderColor, fontSize: 16, lineHeight: 24, marginBottom: 12, backgroundColor: inputBg, color: textColor, textAlignVertical: "top", minHeight: 90 }}
              />
              <TouchableOpacity
                onPress={() => { if (customMsg.trim()) { sendMessage(customMsg.trim()); setCustomMsg(""); } }}
                disabled={!customMsg.trim()}
                style={{ width: "100%", padding: 16, borderRadius: 50, backgroundColor: customMsg.trim() ? "#ec4899" : (dm ? "#334155" : "#e5e7eb"), alignItems: "center" }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: customMsg.trim() ? "#fff" : subtext }}>
                  💌 Send Message to {seniorName}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
