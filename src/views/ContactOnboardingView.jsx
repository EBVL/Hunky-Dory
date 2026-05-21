import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Switch, Image, Keyboard } from "react-native";
import { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../AppContext";
import * as ImagePicker from "expo-image-picker";

const TOTAL_SLIDES = 13;

const FEATURES_PAID = [
  { icon: "🚿", label: "Shower safety monitoring", desc: "Know when they get in and out" },
  { icon: "💊", label: "Medication tracking", desc: "Never miss a dose" },
  { icon: "🍽️", label: "Meal check-ins", desc: "Know when they've eaten" },
  { icon: "🚨", label: "SOS emergency alerts", desc: "Instant notification to you" },
  { icon: "⏰", label: "Custom check-in schedule", desc: "Set specific times for check-ins" },
  { icon: "🔔", label: "Missed check-in alerts", desc: "Get notified if they don't check in" },
];


export default function ContactOnboardingView() {
  const {
    doContactOnboard, saveLovedOneName, setContactName, setContactPhoto,
    setIsPaid, setContactCredentials, setContactPhone, setContactBackupPhone,
    setCredentials, isUsernameTaken,
    darkMode, toggleDarkMode, signOut,
  } = useApp();

  const [slide, setSlide] = useState(0);
  const [lovedOneName, setLovedOneName] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [backupPhone, setBackupPhone] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [seniorUsername, setSeniorUsername] = useState("");
  const [seniorPin, setSeniorPin] = useState("");
  const [seniorPinError, setSeniorPinError] = useState("");
  const [seniorUsernameError, setSeniorUsernameError] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true);

  const lovedOneNameRef = useRef(null);
  const caregiverNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const backupPhoneRef = useRef(null);
  const newPinRef = useRef(null);
  const seniorUsernameRef = useRef(null);

  useEffect(() => {
    const map = {
      3: lovedOneNameRef,
      4: caregiverNameRef,
      6: phoneNumberRef,
      7: backupPhoneRef,
      10: seniorUsernameRef,
      11: newPinRef,
    };
    const ref = map[slide];
    if (!ref) return;
    const t = setTimeout(() => ref.current?.focus(), 400);
    return () => clearTimeout(t);
  }, [slide]);

  const dm = darkMode;
  const cardBg = dm ? "#1e293b" : "#fff";
  const textColor = dm ? "#f1f5f9" : "#1a1a2e";
  const subtext = dm ? "#94a3b8" : "#666";
  const borderColor = dm ? "#334155" : "#e5e7eb";

  const next = () => setSlide((s) => s + 1);
  const back = () => {
    if (slide === 0) signOut();
    else setSlide((s) => s - 1);
  };

  const handleLovedOneNameNext = () => {
    if (lovedOneName.trim()) { saveLovedOneName(lovedOneName.trim()); next(); }
  };

  const handleCaregiverNameNext = () => {
    if (caregiverName.trim()) { setContactName(caregiverName.trim()); next(); }
  };

  const handlePhotoUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
  };

  const handlePhotoNext = () => {
    if (photoUri) setContactPhoto(photoUri);
    next();
  };

  const handleCredentialsNext = () => {
    if (!/^\d{4}$/.test(newPin)) { setPinError("PIN must be exactly 4 digits."); return; }
    if (newPin !== pinConfirm) { setPinError("PINs don't match. Please try again."); return; }
    setPinError("");
    setContactCredentials(caregiverName.trim().toLowerCase(), newPin);
    next();
  };

  const handleSeniorCredentialsNext = () => {
    if (!seniorUsername.trim()) { setSeniorUsernameError("Please enter a username."); return; }
    if (isUsernameTaken(seniorUsername)) { setSeniorUsernameError("That username is taken, please try again."); return; }
    if (!/^\d{4}$/.test(seniorPin)) { setSeniorPinError("PIN must be exactly 4 digits."); return; }
    setSeniorPinError("");
    setSeniorUsernameError("");
    setCredentials(seniorUsername.trim().toLowerCase(), seniorPin);
    Keyboard.dismiss();
    next();
  };

  const finish = (paid) => {
    setIsPaid(paid);
    doContactOnboard(staySignedIn);
  };

  // ── Progress bar ──────────────────────────────────────────────────────────
  const ProgressBar = () => (
    <View style={{ position: "absolute", top: 54, left: 0, right: 0, height: 4, backgroundColor: "rgba(255,255,255,0.2)", zIndex: 100 }}>
      <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.9)", width: `${((slide + 1) / TOTAL_SLIDES) * 100}%` }} />
    </View>
  );

  // ── Back button ────────────────────────────────────────────────────────────
  const BackBtn = () => (
    <TouchableOpacity
      onPress={back}
      style={{ position: "absolute", top: 62, left: 20, zIndex: 10, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
    >
      <Text style={{ fontSize: 15, color: "#fff", fontWeight: "600" }}>← Back</Text>
    </TouchableOpacity>
  );

  const DarkToggle = () => (
    <TouchableOpacity
      onPress={toggleDarkMode}
      style={{ position: "absolute", top: 62, right: 20, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, zIndex: 10 }}
    >
      <Text style={{ fontSize: 18 }}>{dm ? "☀️" : "🌙"}</Text>
    </TouchableOpacity>
  );

  const TapHint = () => (
    <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 64 }}>Tap to continue</Text>
  );

  const ContinueBtn = ({ active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!active}
      style={{ paddingHorizontal: 48, paddingVertical: 18, borderRadius: 50, borderWidth: 2, borderColor: active ? "#1a1a2e" : "rgba(255,255,255,0.3)", backgroundColor: active ? "#F8F9F6" : "rgba(255,255,255,0.15)" }}
    >
      <Text style={{ fontSize: 18, fontWeight: "700", color: active ? "#1a1a2e" : "rgba(255,255,255,0.4)" }}>Continue →</Text>
    </TouchableOpacity>
  );

  const inputStyle = {
    width: "100%", maxWidth: 320, paddingHorizontal: 22, paddingVertical: 18, borderRadius: 16,
    fontSize: 20, textAlign: "center", backgroundColor: cardBg, color: textColor, marginBottom: 20,
  };

  // ── Slide 0: It's time to breathe ─────────────────────────────────────────
  if (slide === 0) return (
    <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
      <LinearGradient colors={["#071829", "#0c2d5a"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <Text style={{ fontSize: 72, marginBottom: 24 }}>🫂</Text>
        <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 44 }}>It's time to breathe.</Text>
        <TapHint />
      </LinearGradient>
    </TouchableOpacity>
  );

  // ── Slide 1: Your loved one is safe ───────────────────────────────────────
  if (slide === 1) return (
    <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
      <LinearGradient colors={["#0c2d5a", "#185FA5"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <Text style={{ fontSize: 72, marginBottom: 24 }}>💚</Text>
        <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 44 }}>Your loved one is safe.</Text>
        <TapHint />
      </LinearGradient>
    </TouchableOpacity>
  );

  // ── Slide 2: With Hunky Dory ───────────────────────────────────────────────
  if (slide === 2) return (
    <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
      <LinearGradient colors={["#185FA5", "#1a72c4"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <Text style={{ fontSize: 72, marginBottom: 24 }}>🫂</Text>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 40, maxWidth: 320 }}>
          With Hunky Dory you can help keep track of your independent loved one.
        </Text>
        <TapHint />
      </LinearGradient>
    </TouchableOpacity>
  );

  // ── Slide 3: Loved one's name ──────────────────────────────────────────────
  if (slide === 3) return (
    <LinearGradient colors={["#1a72c4", "#185FA5"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 110 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>💛</Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 32, lineHeight: 36 }}>What's your loved one's name?</Text>
          <TextInput
            ref={lovedOneNameRef}
            value={lovedOneName}
            onChangeText={setLovedOneName}
            onSubmitEditing={handleLovedOneNameNext}
            placeholder="Their first name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={{ ...inputStyle, alignSelf: "center" }}
          />
          <ContinueBtn active={!!lovedOneName.trim()} onPress={handleLovedOneNameNext} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // ── Slide 4: Caregiver's name ──────────────────────────────────────────────
  if (slide === 4) return (
    <LinearGradient colors={["#185FA5", "#0e4d7a"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 110 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🙋</Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8, lineHeight: 36 }}>And what's your name?</Text>
          <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 32, maxWidth: 280, lineHeight: 24 }}>
            So {lovedOneName || "your loved one"} knows who's watching over them.
          </Text>
          <TextInput
            ref={caregiverNameRef}
            value={caregiverName}
            onChangeText={setCaregiverName}
            onSubmitEditing={handleCaregiverNameNext}
            placeholder="Your first name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={{ ...inputStyle, alignSelf: "center" }}
          />
          <ContinueBtn active={!!caregiverName.trim()} onPress={handleCaregiverNameNext} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // ── Slide 5: Your photo ────────────────────────────────────────────────────
  if (slide === 5) return (
    <LinearGradient colors={["#0e4d7a", "#0c2d5a"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 110 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8, lineHeight: 36 }}>
            Add a photo of yourself
          </Text>
          <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 32, maxWidth: 300, lineHeight: 24 }}>
            So {lovedOneName || "your loved one"} can see who's looking out for them.
          </Text>
          <TouchableOpacity onPress={handlePhotoUpload} style={{ marginBottom: 32, alignItems: "center" }}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: "#fff" }} />
            ) : (
              <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 3, borderColor: "rgba(255,255,255,0.4)", borderStyle: "dashed", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 40 }}>📷</Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>Tap to add</Text>
              </View>
            )}
          </TouchableOpacity>
          {photoUri && (
            <TouchableOpacity onPress={handlePhotoUpload} style={{ marginBottom: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 50, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)" }}>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Change photo</Text>
            </TouchableOpacity>
          )}
          <ContinueBtn active onPress={handlePhotoNext} />
          {!photoUri && (
            <TouchableOpacity onPress={next} style={{ marginTop: 16 }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // ── Slide 6: Your phone number ─────────────────────────────────────────────
  if (slide === 6) return (
    <LinearGradient colors={["#0c2d5a", "#185FA5"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 110 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📞</Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8, lineHeight: 36 }}>
            What's your phone number?
          </Text>
          <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 32, maxWidth: 300, lineHeight: 24 }}>
            This will show on {lovedOneName || "your loved one"}'s contact button so they can reach you.
          </Text>
          <TextInput
            ref={phoneNumberRef}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onSubmitEditing={() => { if (phoneNumber.trim()) { setContactPhone(phoneNumber.trim()); next(); } }}
            placeholder="(555) 000-0000"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="phone-pad"
            style={{ ...inputStyle, alignSelf: "center" }}
          />
          <ContinueBtn
            active={!!phoneNumber.trim()}
            onPress={() => { setContactPhone(phoneNumber.trim()); next(); }}
          />
          <TouchableOpacity onPress={next} style={{ marginTop: 16 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // ── Slide 7: Backup phone number ───────────────────────────────────────────
  if (slide === 7) return (
    <LinearGradient colors={["#185FA5", "#071829"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 110 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📱</Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8, lineHeight: 36 }}>
            Add a backup number
          </Text>
          <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 32, maxWidth: 300, lineHeight: 24 }}>
            A second number (family member, neighbor) in case you can't be reached.
          </Text>
          <TextInput
            ref={backupPhoneRef}
            value={backupPhone}
            onChangeText={setBackupPhone}
            onSubmitEditing={() => { if (backupPhone.trim()) setContactBackupPhone(backupPhone.trim()); next(); }}
            placeholder="(555) 000-0000"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="phone-pad"
            style={{ ...inputStyle, alignSelf: "center" }}
          />
          <ContinueBtn
            active={!!backupPhone.trim()}
            onPress={() => { setContactBackupPhone(backupPhone.trim()); next(); }}
          />
          <TouchableOpacity onPress={next} style={{ marginTop: 16 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // ── Slide 8: Confirmation message ─────────────────────────────────────────
  if (slide === 8) return (
    <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
      <LinearGradient colors={["#071829", "#185FA5"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <Text style={{ fontSize: 64, marginBottom: 24 }}>🌟</Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 38, maxWidth: 320 }}>
          {caregiverName || "You"}, together we can help keep {lovedOneName || "your loved one"} independent while making sure they're properly being taken care of.
        </Text>
        <TapHint />
      </LinearGradient>
    </TouchableOpacity>
  );

  // ── Slide 9: Peace of mind ─────────────────────────────────────────────────
  if (slide === 9) return (
    <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
      <LinearGradient colors={["#185FA5", "#0c2d5a"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <Text style={{ fontSize: 72, marginBottom: 24 }}>☮️</Text>
        <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 44, marginBottom: 12 }}>Peace of mind starts now.</Text>
        <Text style={{ fontSize: 22, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 32, marginBottom: 8 }}>Embrace your loved one.</Text>
        <Text style={{ fontSize: 26, fontWeight: "700", color: "#fff", textAlign: "center" }}>That's Hunky Dory. 🫂</Text>
        <TapHint />
      </LinearGradient>
    </TouchableOpacity>
  );

  // ── Slide 10: Create senior's username & PIN ──────────────────────────────
  if (slide === 10) return (
    <LinearGradient colors={["#0c2d5a", "#185FA5"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 110 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔑</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8, lineHeight: 34 }}>
            Create a username and PIN for {lovedOneName || "your loved one"}
          </Text>
          <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 28, maxWidth: 300, lineHeight: 24 }}>
            They'll use these to sign in to Hunky Dory on their device.
          </Text>

          <View style={{ width: "100%", maxWidth: 320, marginBottom: 14 }}>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontWeight: "600" }}>Username</Text>
            <TextInput
              ref={seniorUsernameRef}
              value={seniorUsername}
              onChangeText={(v) => { setSeniorUsername(v); setSeniorUsernameError(""); }}
              placeholder="Choose a username"
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              style={{ paddingHorizontal: 22, paddingVertical: 18, borderRadius: 16, fontSize: 20, textAlign: "center", backgroundColor: cardBg, color: textColor }}
            />
            {!!seniorUsernameError && (
              <Text style={{ fontSize: 13, color: "#fca5a5", marginTop: 6, textAlign: "center" }}>{seniorUsernameError}</Text>
            )}
          </View>

          <View style={{ width: "100%", maxWidth: 320, marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontWeight: "600" }}>4-Digit PIN</Text>
            <TextInput
              value={seniorPin}
              onChangeText={(v) => { setSeniorPin(v.replace(/\D/g, "").slice(0, 4)); setSeniorPinError(""); }}
              placeholder="• • • •"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              onSubmitEditing={handleSeniorCredentialsNext}
              style={{ paddingHorizontal: 22, paddingVertical: 18, borderRadius: 16, fontSize: 28, textAlign: "center", backgroundColor: cardBg, color: textColor, letterSpacing: 8 }}
            />
            {!!seniorPinError && (
              <Text style={{ fontSize: 13, color: "#fca5a5", marginTop: 6, textAlign: "center" }}>{seniorPinError}</Text>
            )}
          </View>

          <View style={{ marginBottom: 20 }} />
          <ContinueBtn active={!!seniorUsername.trim() && seniorPin.length === 4} onPress={handleSeniorCredentialsNext} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // ── Slide 11: Create your own sign-in PIN ─────────────────────────────────
  if (slide === 11) return (
    <LinearGradient colors={["#185FA5", "#071829"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <DarkToggle />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 110 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔐</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8, lineHeight: 34 }}>
            Create your sign-in PIN
          </Text>
          <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 28, maxWidth: 300, lineHeight: 24 }}>
            You'll use this 4-digit PIN to sign back in to your account.
          </Text>

          <View style={{ width: "100%", maxWidth: 320, marginBottom: 14 }}>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontWeight: "600" }}>Choose a 4-digit PIN</Text>
            <TextInput
              ref={newPinRef}
              value={newPin}
              onChangeText={(v) => { setNewPin(v.replace(/\D/g, "").slice(0, 4)); setPinError(""); }}
              placeholder="• • • •"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              style={{ paddingHorizontal: 22, paddingVertical: 18, borderRadius: 16, fontSize: 28, textAlign: "center", backgroundColor: cardBg, color: textColor, letterSpacing: 8 }}
            />
          </View>

          <View style={{ width: "100%", maxWidth: 320, marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontWeight: "600" }}>Confirm PIN</Text>
            <TextInput
              value={pinConfirm}
              onChangeText={(v) => { setPinConfirm(v.replace(/\D/g, "").slice(0, 4)); setPinError(""); }}
              placeholder="• • • •"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              onSubmitEditing={handleCredentialsNext}
              style={{ paddingHorizontal: 22, paddingVertical: 18, borderRadius: 16, fontSize: 28, textAlign: "center", backgroundColor: cardBg, color: textColor, letterSpacing: 8 }}
            />
            {!!pinError && (
              <Text style={{ fontSize: 13, color: "#fca5a5", marginTop: 6, textAlign: "center" }}>{pinError}</Text>
            )}
          </View>

          <View style={{ marginBottom: 20 }} />
          <ContinueBtn active={newPin.length === 4 && pinConfirm.length === 4} onPress={handleCredentialsNext} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // ── Slide 12: Subscription ────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dm ? "#0f172a" : "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <LinearGradient colors={["#185FA5", "#0c2d5a"]} style={{ padding: 44, paddingBottom: 36, alignItems: "center", position: "relative" }}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: "rgba(255,255,255,0.2)" }}>
            <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.9)", width: "100%" }} />
          </View>
          <BackBtn />
          <TouchableOpacity
            onPress={toggleDarkMode}
            style={{ position: "absolute", top: 62, right: 20, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 18 }}>{dm ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 52, marginBottom: 10, marginTop: 16 }}>🫂</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 6 }}>Hunky Dory Premium</Text>
          <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 24, textAlign: "center" }}>
            Keep {lovedOneName || "your loved one"} safe — free for 3 days.
          </Text>
        </LinearGradient>

        {/* Stay signed in toggle */}
        <View style={{ margin: 16, marginBottom: 0, padding: 18, backgroundColor: dm ? "#1e293b" : "#fff", borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: dm ? "#334155" : "#e5e7eb" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: dm ? "#f1f5f9" : "#1a1a2e" }}>Stay signed in</Text>
            <Text style={{ fontSize: 13, color: dm ? "#94a3b8" : "#666", marginTop: 2 }}>Reopen the app without signing in again</Text>
          </View>
          <Switch
            value={staySignedIn}
            onValueChange={setStaySignedIn}
            trackColor={{ false: "#d1d5db", true: "#6d28d9" }}
            thumbColor="#fff"
          />
        </View>

        <View style={{ padding: 16 }}>
          {/* Annual card — 3-day trial, then annual */}
          <TouchableOpacity
            onPress={() => finish(true)}
            style={{ width: "100%", padding: 24, borderRadius: 24, borderWidth: 2, borderColor: "#fbbf24", backgroundColor: dm ? "#1e293b" : "#F8F9F6", marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
          >
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <View style={{ backgroundColor: "#fbbf24", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#78350f", letterSpacing: 1 }}>BEST VALUE</Text>
              </View>
              <View style={{ backgroundColor: "#1a1a2e", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#F8F9F6", letterSpacing: 1 }}>3-DAY FREE TRIAL</Text>
              </View>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "800", color: textColor, marginBottom: 6 }}>$60 / year</Text>
            <Text style={{ fontSize: 15, color: subtext, marginBottom: 20 }}>3-day free trial, then $60/year — just $5/month. Cancel before trial ends to avoid charge.</Text>
            <View style={{ backgroundColor: dm ? "#0f172a" : "#e8ebe8", borderRadius: 12, padding: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>Start 3-day free trial →</Text>
            </View>
          </TouchableOpacity>

          {/* Monthly card */}
          <TouchableOpacity
            onPress={() => finish(true)}
            style={{ width: "100%", padding: 24, borderRadius: 24, borderWidth: 2, borderColor: "#1a1a2e", backgroundColor: dm ? "#1e293b" : "#F8F9F6", marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
          >
            <View style={{ alignSelf: "flex-start", backgroundColor: "#1a1a2e", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#F8F9F6", letterSpacing: 1 }}>MONTHLY</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "800", color: textColor, marginBottom: 6 }}>$5.99 / month</Text>
            <Text style={{ fontSize: 15, color: subtext, marginBottom: 20 }}>Cancel anytime</Text>
            <View style={{ backgroundColor: dm ? "#0f172a" : "#e8ebe8", borderRadius: 12, padding: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>Choose monthly →</Text>
            </View>
          </TouchableOpacity>

          {/* Features */}
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: dm ? 0.3 : 0.07, shadowRadius: 6, elevation: 3 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#7c3aed", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>What's included</Text>
            {FEATURES_PAID.map((f) => (
              <View key={f.label} style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: dm ? "#312e81" : "#ede9fe", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 20 }}>{f.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: textColor }}>{f.label}</Text>
                  <Text style={{ fontSize: 13, color: subtext }}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
