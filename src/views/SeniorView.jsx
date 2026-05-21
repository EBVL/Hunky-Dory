import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal, Animated } from "react-native";
import { useRef, useState, useEffect } from "react";
import { Image } from "react-native";
import { useApp, parseTimeStr } from "../AppContext";
import * as Haptics from "expo-haptics";
import HunkyDoryHeader from "../components/HunkyDoryHeader";

const C = {
  green:        "#3B6D11",
  greenSurface: "#EAF3DE",
  greenBorder:  "#C5DFA0",
  red:          "#E24B4A",
  redSurface:   "#FDF0F0",
  bg:           "#F2F5F0",
  white:        "#FFFFFF",
  dark:         "#1a1a2e",
  subtext:      "#6B7280",
  border:       "#E5E7EB",
  cardBg:       "#FFFFFF",
};

export default function SeniorView() {
  const {
    seniorSignOut, isPaid, seniorName, today,
    checkedInToday, checkInSchedule, completedCheckIns, canCheckIn, activeSlot,
    lastCheckIn, doCheckIn,
    showerStatus, showerDuration, doShowerIn, doShowerOut,
    medications, toggleMed,
    mealCount, addMealCount,
    incomingMessage, dismissMessage,
    sendSOS, contactName, contactPhoto, contactPhone, contactBackupPhone,
    darkMode, toggleDarkMode,
  } = useApp();

  const [sosSent, setSosSent] = useState(false);
  const [sosHint, setSosHint] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const lastSosTapRef = useRef(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sosFlashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (canCheckIn && !checkedInToday) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [canCheckIn, checkedInToday]);

  useEffect(() => {
    if (sosSent) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(sosFlashAnim, { toValue: 1, duration: 350, useNativeDriver: false }),
          Animated.timing(sosFlashAnim, { toValue: 0, duration: 350, useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      sosFlashAnim.setValue(0);
    }
  }, [sosSent]);

  const sosOverlayBg = sosFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(226,75,74,0.0)", "rgba(226,75,74,0.18)"],
  });

  const handleSosPress = () => {
    const now = Date.now();
    if (lastSosTapRef.current && now - lastSosTapRef.current < 2000) {
      lastSosTapRef.current = null;
      setSosHint(false);
      setSosSent(true);
      sendSOS();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      lastSosTapRef.current = now;
      setSosHint(true);
      setTimeout(() => {
        setSosHint(false);
        lastSosTapRef.current = null;
      }, 2500);
    }
  };

  const now = new Date();
  const slotStatus = (t) => {
    if (completedCheckIns.includes(t)) return "done";
    const diff = now - parseTimeStr(t);
    if (Math.abs(diff) <= 3600000) return "active";
    if (diff > 3600000) return "missed";
    return "upcoming";
  };
  const nextUpcoming = checkInSchedule.find(
    (t) => slotStatus(t) === "upcoming" || slotStatus(t) === "active"
  );

  const medsTaken = medications.filter((m) => m.taken).length;
  const medsTotal = medications.length;
  const allMedsDone = medsTotal > 0 && medsTaken === medsTotal;

  // ── Contact photo modal ───────────────────────────────────────────────────
  const ContactModal = () => (
    <Modal visible={showContactModal} transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1} onPress={() => setShowContactModal(false)}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 32 }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{ backgroundColor: C.white, borderRadius: 28, padding: 28, alignItems: "center", minWidth: 280 }}>
            {contactPhoto ? (
              <Image source={{ uri: contactPhoto }} style={{ width: 140, height: 140, borderRadius: 70, marginBottom: 16 }} />
            ) : (
              <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 64 }}>🫂</Text>
              </View>
            )}
            <Text style={{ fontSize: 22, fontWeight: "800", color: C.dark, textAlign: "center", marginBottom: 4 }}>{contactName}</Text>
            <Text style={{ fontSize: 14, color: "#3B82F6", marginBottom: 20 }}>Your emergency contact 💙</Text>

            {(contactPhone || contactBackupPhone) && (
              <View style={{ width: "100%", gap: 10, marginBottom: 20 }}>
                {contactPhone ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "#EFF6FF", borderRadius: 14 }}>
                    <Text style={{ fontSize: 22 }}>📞</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#3B82F6", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Phone</Text>
                      <Text style={{ fontSize: 17, fontWeight: "700", color: C.dark }}>{contactPhone}</Text>
                    </View>
                  </View>
                ) : null}
                {contactBackupPhone ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "#F0FDF4", borderRadius: 14 }}>
                    <Text style={{ fontSize: 22 }}>📱</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#16a34a", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Backup</Text>
                      <Text style={{ fontSize: 17, fontWeight: "700", color: C.dark }}>{contactBackupPhone}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowContactModal(false)}
              style={{ paddingHorizontal: 28, paddingVertical: 12, borderRadius: 50, borderWidth: 2, borderColor: C.dark, backgroundColor: "#F8F9F6" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: C.dark }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // ── Incoming message modal ────────────────────────────────────────────────
  const MessageModal = () => (
    <Modal visible={!!incomingMessage} transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1} onPress={dismissMessage}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{ backgroundColor: C.white, borderRadius: 24, padding: 32, maxWidth: 340, width: "100%", alignItems: "center" }}>
            <Text style={{ fontSize: 52, marginBottom: 12 }}>💌</Text>
            <Text style={{ fontSize: 14, color: C.subtext, marginBottom: 8 }}>Message from your family</Text>
            <Text style={{ fontSize: 24, fontWeight: "700", color: C.dark, lineHeight: 34, marginBottom: 28, textAlign: "center" }}>
              "{incomingMessage}"
            </Text>
            <TouchableOpacity
              onPress={dismissMessage}
              style={{ width: "100%", padding: 16, borderRadius: 50, backgroundColor: "#ec4899", alignItems: "center" }}
            >
              <Text style={{ color: C.white, fontSize: 18, fontWeight: "700" }}>💗 Send Love Back</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>

      {/* SOS screen flash */}
      {sosSent && (
        <Animated.View
          pointerEvents="none"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 49, backgroundColor: sosOverlayBg }}
        />
      )}

      <ContactModal />
      <MessageModal />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <HunkyDoryHeader
        label={today()}
        title={`Good morning, ${seniorName}! 👋`}
        bgColor="#185FA5"
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onSignOut={seniorSignOut}
      />

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>

        {/* ── I'm OK check-in — whole tile is the button ──────────────────── */}
        {checkedInToday ? (
          <View style={{
            backgroundColor: C.greenSurface, borderRadius: 24, padding: 20, marginBottom: 14,
            borderWidth: 2, borderColor: C.greenBorder,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
            alignItems: "center", paddingVertical: 28,
          }}>
            <View style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: C.green, alignItems: "center", justifyContent: "center", marginBottom: 12,
            }}>
              <Text style={{ fontSize: 34 }}>✓</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: "800", color: C.green, marginBottom: 4 }}>You're checked in!</Text>
            <Text style={{ fontSize: 14, color: C.subtext }}>Last check-in at {lastCheckIn}</Text>
            <Text style={{ fontSize: 13, color: C.subtext, marginTop: 2 }}>Your family knows you're safe 💚</Text>
          </View>
        ) : canCheckIn ? (
          <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 14 }}>
            <TouchableOpacity
              onPress={() => {
                doCheckIn();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              activeOpacity={0.85}
              style={{
                width: "100%", paddingVertical: 36, borderRadius: 24,
                backgroundColor: C.green, alignItems: "center", justifyContent: "center", gap: 8,
                shadowColor: C.green, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
              }}
            >
              {activeSlot && (
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
                  ⏰ Window open for {activeSlot}
                </Text>
              )}
              <Text style={{ fontSize: 44 }}>✅</Text>
              <Text style={{ fontSize: 30, fontWeight: "900", color: C.white, letterSpacing: 1 }}>I'M OK</Text>
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>Tap to let your family know</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={{
            backgroundColor: C.white, borderRadius: 24, padding: 20, marginBottom: 14,
            borderWidth: 2, borderColor: C.border,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
            alignItems: "center", paddingVertical: 28,
          }}>
            <Text style={{ fontSize: 38, marginBottom: 10 }}>🕐</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: C.subtext, marginBottom: 4 }}>Next check-in at</Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: C.dark }}>{nextUpcoming || "—"}</Text>
            <Text style={{ fontSize: 12, color: C.subtext, marginTop: 8, textAlign: "center" }}>
              Button opens 1 hour before this time.
            </Text>
          </View>
        )}

        {/* ── Medications — horizontal scroll of pill buttons ──────────────── */}
        <View style={{
          backgroundColor: C.white, borderRadius: 20, padding: 18, marginBottom: 14,
          borderWidth: 2, borderColor: allMedsDone ? C.greenBorder : C.border,
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: C.subtext, flex: 1 }}>
              Medications
            </Text>
            {medsTotal > 0 && (
              <Text style={{ fontSize: 13, fontWeight: "700", color: allMedsDone ? C.green : C.subtext }}>
                {medsTaken}/{medsTotal} taken
              </Text>
            )}
          </View>
          {medsTotal === 0 ? (
            <Text style={{ fontSize: 15, color: C.subtext, textAlign: "center", paddingVertical: 8 }}>No medications set up yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 4, paddingBottom: 4 }}>
                {medications.map((med) => (
                  <TouchableOpacity
                    key={med.id}
                    onPress={() => {
                      toggleMed(med.id);
                      if (!med.taken) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                    style={{
                      paddingVertical: 14, paddingHorizontal: 18, borderRadius: 16,
                      borderWidth: 2,
                      borderColor: med.taken ? C.green : C.border,
                      backgroundColor: med.taken ? C.greenSurface : "#F9FAFB",
                      alignItems: "center", gap: 6, minWidth: 90,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{med.taken ? "✓" : "💊"}</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: med.taken ? C.green : C.dark, textAlign: "center" }} numberOfLines={2}>
                      {med.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.subtext }}>{med.time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* ── Contact tile — tappable to show photo modal ──────────────────── */}
        <TouchableOpacity
          onPress={() => setShowContactModal(true)}
          activeOpacity={0.82}
          style={{
            backgroundColor: C.white, borderRadius: 20, padding: 18, marginBottom: 14,
            borderWidth: 2, borderColor: C.border,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
            flexDirection: "row", alignItems: "center", gap: 16,
          }}
        >
          {contactPhoto ? (
            <Image source={{ uri: contactPhoto }} style={{ width: 56, height: 56, borderRadius: 28 }} />
          ) : (
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 28 }}>🫂</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: C.subtext, marginBottom: 4 }}>MY CONTACT</Text>
            <Text style={{ fontSize: 17, fontWeight: "800", color: C.dark }} numberOfLines={1}>
              {contactName}
            </Text>
            {contactPhone ? (
              <Text style={{ fontSize: 13, color: C.dark, fontWeight: "600", marginTop: 2 }}>{contactPhone}</Text>
            ) : null}
            <Text style={{ fontSize: 12, color: "#3B82F6", marginTop: 2 }}>Tap to view • Watching over you 💙</Text>
          </View>
        </TouchableOpacity>

        {/* ── Shower check-in (paid) ───────────────────────────────────────── */}
        {isPaid && (
          <View style={{
            backgroundColor: C.white, borderRadius: 20, padding: 18, marginBottom: 14,
            borderWidth: 2, borderColor: C.border,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: C.subtext, marginBottom: 14 }}>
              Shower Check-In
            </Text>
            {showerStatus === "in" && (
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#0891B2", textAlign: "center", marginBottom: 12 }}>
                🚿 You're in the shower
              </Text>
            )}
            {showerStatus === "out" && (
              <Text style={{ fontSize: 14, fontWeight: "600", color: C.green, textAlign: "center", marginBottom: 12 }}>
                ✨ Shower done — your family knows!
              </Text>
            )}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => { doShowerIn(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                style={{
                  flex: 1, paddingVertical: 16, borderRadius: 14,
                  borderWidth: 2, borderColor: showerStatus === "in" ? C.green : C.border,
                  backgroundColor: showerStatus === "in" ? C.greenSurface : "#F9FAFB",
                  alignItems: "center", gap: 4,
                }}
              >
                <Text style={{ fontSize: 26 }}>🚿</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: C.dark }}>Getting In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { doShowerOut(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                disabled={showerStatus !== "in"}
                style={{
                  flex: 1, paddingVertical: 16, borderRadius: 14,
                  borderWidth: 2, borderColor: C.border,
                  backgroundColor: "#F9FAFB", alignItems: "center", gap: 4,
                  opacity: showerStatus === "in" ? 1 : 0.5,
                }}
              >
                <Text style={{ fontSize: 26 }}>🧴</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: C.dark }}>Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Today's Meals — counter + I Ate! button (paid) ──────────────── */}
        {isPaid && (
          <View style={{
            backgroundColor: C.white, borderRadius: 20, padding: 18, marginBottom: 14,
            borderWidth: 2, borderColor: C.border,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: C.subtext, marginBottom: 8 }}>
              Today's Meals
            </Text>
            <Text style={{ fontSize: 56, fontWeight: "900", color: C.dark, textAlign: "center", marginVertical: 8 }}>
              {mealCount}
            </Text>
            <Text style={{ fontSize: 14, color: C.subtext, textAlign: "center", marginBottom: 16 }}>
              {mealCount === 0 ? "No meals logged yet" : mealCount === 1 ? "meal today" : "meals today"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                addMealCount();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              style={{
                width: "100%", paddingVertical: 18, borderRadius: 16,
                backgroundColor: "#FEF3C7", borderWidth: 2, borderColor: "#FCD34D",
                alignItems: "center", gap: 4,
              }}
            >
              <Text style={{ fontSize: 28 }}>🍽️</Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#92400E" }}>I Ate!</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ── Fixed SOS button ─────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10, backgroundColor: C.bg }}>
        {sosSent ? (
          <View style={{ gap: 10 }}>
            <View style={{
              width: "100%", paddingVertical: 22, borderRadius: 18,
              backgroundColor: C.red, alignItems: "center",
              shadowColor: C.red, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
            }}>
              <Text style={{ fontSize: 20, fontWeight: "900", color: C.white, letterSpacing: 1 }}>🚨  ALERT SENT</Text>
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{contactName} has been notified</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSosSent(false)}
              style={{ width: "100%", paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: C.red, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, color: C.red, fontWeight: "700" }}>I'm OK now — cancel alert</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {sosHint && (
              <Text style={{ textAlign: "center", color: C.red, fontWeight: "700", fontSize: 14, marginBottom: 8 }}>
                ⚠️ Tap again to confirm SOS
              </Text>
            )}
            <TouchableOpacity
              onPress={handleSosPress}
              activeOpacity={0.82}
              style={{
                width: "100%", paddingVertical: 22, borderRadius: 18,
                backgroundColor: sosHint ? "#b91c1c" : C.red,
                alignItems: "center", justifyContent: "center",
                shadowColor: C.red, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "900", color: C.white, letterSpacing: 2 }}>🚨  SOS EMERGENCY</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}
