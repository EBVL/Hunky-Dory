import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Modal, Image } from "react-native";
import { useState, useEffect } from "react";
import { useApp } from "../AppContext";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

const QUICK_MESSAGES = [
  { label: "❤️ I love you!", text: "I love you!" },
  { label: "😊 Thinking of you", text: "Just thinking of you today, have a wonderful day!" },
  { label: "📞 Call me!", text: "Give me a call when you get a chance!" },
  { label: "🌟 You're amazing", text: "You're doing amazing and I'm so proud of you!" },
];

const TIME_OPTIONS = ["6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM"];

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
  } = useApp();

  const [medForm, setMedForm] = useState({ name: "", time: "8:00 AM" });
  const [pairUsername, setPairUsername] = useState("");
  const [pairPin, setPairPin] = useState("");
  const [pairError, setPairError] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMedTimePicker, setShowMedTimePicker] = useState(false);

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

  const openEditMed = (med) => { setEditingMed(med); setMedForm({ name: med.name, time: med.time }); setShowAddMed(true); };
  const openAddMed = () => { setEditingMed(null); setMedForm({ name: "", time: "8:00 AM" }); setShowAddMed(true); };
  const handleSaveMed = () => { if (!medForm.name.trim()) return; saveMed(medForm); setShowAddMed(false); };

  // ── Pairing screen ─────────────────────────────────────────────────────────
  if (!isPaired) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: dm ? "#0f172a" : "#EFF4F2" }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            onPress={toggleDarkMode}
            style={{ position: "absolute", top: 16, right: 20, backgroundColor: dm ? "#334155" : "rgba(0,0,0,0.08)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 18 }}>{dm ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>

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
        <TouchableOpacity activeOpacity={1} onPress={() => setShowAddMed(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
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
                  onPress={() => setShowMedTimePicker(true)}
                  style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: borderColor, backgroundColor: inputBg }}
                >
                  <Text style={{ fontSize: 16, color: textColor }}>{medForm.time}</Text>
                </TouchableOpacity>
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
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Med time picker modal */}
      <Modal visible={showMedTimePicker} transparent animationType="slide">
        <TouchableOpacity activeOpacity={1} onPress={() => setShowMedTimePicker(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, paddingBottom: 40, maxHeight: 400 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: textColor, marginBottom: 14, textAlign: "center" }}>Select Time</Text>
              <ScrollView>
                {TIME_OPTIONS.map((t) => (
                  <TouchableOpacity key={t} onPress={() => { setMedForm((f) => ({ ...f, time: t })); setShowMedTimePicker(false); }}
                    style={{ padding: 16, borderRadius: 12, marginBottom: 6, backgroundColor: medForm.time === t ? (dm ? "#334155" : "#e8ebe8") : "transparent", alignItems: "center" }}>
                    <Text style={{ fontSize: 17, color: textColor, fontWeight: medForm.time === t ? "700" : "400" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Time picker for check-in schedule */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <TouchableOpacity activeOpacity={1} onPress={() => setShowTimePicker(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, paddingBottom: 40, maxHeight: 400 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: textColor, marginBottom: 14, textAlign: "center" }}>Add Check-In Time</Text>
              <ScrollView>
                {TIME_OPTIONS.map((t) => (
                  <TouchableOpacity key={t} onPress={() => { addCheckInTime(t); setShowTimePicker(false); }}
                    style={{ padding: 16, borderRadius: 12, marginBottom: 6, alignItems: "center" }}>
                    <Text style={{ fontSize: 17, color: textColor }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View style={{ backgroundColor: "#1e3a5f", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>🫂 Hunky Dory</Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}>Hi {contactName} 👋</Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Watching over {seniorName}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={toggleDarkMode} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ fontSize: 18 }}>{dm ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={contactSignOut} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      </View>

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
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ width: "100%", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: borderColor, backgroundColor: dm ? "#1e293b" : "#F8F9F6", alignItems: "center" }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>+ Add Check-In Time</Text>
              </TouchableOpacity>
            </View>

            {/* Status grid — horizontal scroll so text doesn't wrap */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
              <View style={{ ...card, margin: 0, marginBottom: 0, width: 130, borderLeftWidth: 4, borderLeftColor: checkedInToday ? "#16a34a" : "#dc2626" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: subtext, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Check-In</Text>
                <Text style={{ fontSize: 28 }}>{checkedInToday ? "✅" : "❓"}</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: checkedInToday ? "#16a34a" : "#dc2626", marginTop: 4 }}>
                  {checkedInToday ? lastCheckIn : `${checkInCount}/${Math.max(requiredCheckIns, 1)}`}
                </Text>
              </View>
              {isPaid && (
                <View style={{ ...card, margin: 0, marginBottom: 0, width: 130, borderLeftWidth: 4, borderLeftColor: showerStatus === "in" ? "#0891b2" : showerStatus === "out" ? "#16a34a" : borderColor }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: subtext, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Shower</Text>
                  <Text style={{ fontSize: 28 }}>🚿</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", marginTop: 4, color: showerStatus === "in" ? "#0891b2" : showerStatus === "out" ? "#16a34a" : subtext }}>
                    {showerStatus === "in" ? `In shower${showerMinutes !== null ? ` · ${showerMinutes}m` : ""}` : showerStatus === "out" ? `Done${showerDuration ? ` · ${showerDuration}m` : ""}` : "No activity"}
                  </Text>
                </View>
              )}
              {isPaid && (
                <View style={{ ...card, margin: 0, marginBottom: 0, width: 130, borderLeftWidth: 4, borderLeftColor: "#7c3aed" }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: subtext, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Meds</Text>
                  <Text style={{ fontSize: 28 }}>💊</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#7c3aed", marginTop: 4 }}>{medications.filter((m) => m.taken).length}/{medications.length} taken</Text>
                </View>
              )}
              {isPaid && (
                <View style={{ ...card, margin: 0, marginBottom: 0, width: 130, borderLeftWidth: 4, borderLeftColor: "#d97706" }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: subtext, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Meals</Text>
                  <Text style={{ fontSize: 28 }}>🍽️</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#d97706", marginTop: 4 }}>{mealCount} meal{mealCount !== 1 ? "s" : ""} today</Text>
                </View>
              )}
            </ScrollView>

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
