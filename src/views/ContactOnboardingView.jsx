import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Switch, Image, Keyboard, Animated, useWindowDimensions } from "react-native";
import { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../AppContext";
import * as ImagePicker from "expo-image-picker";
import { HunkyDoryLogo, HunkyDoryBanner } from "../components/HunkyDoryHeader";

const TOTAL_SLIDES = 15;

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
    setContactEmail,
    setCredentials, isUsernameTaken,
    darkMode, toggleDarkMode, signOut,
  } = useApp();

  const [slide, setSlide] = useState(0);
  const [lovedOneName, setLovedOneName] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [backupPhone, setBackupPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [seniorUsername, setSeniorUsername] = useState("");
  const [seniorPin, setSeniorPin] = useState("");
  const [seniorPinError, setSeniorPinError] = useState("");
  const [seniorUsernameError, setSeniorUsernameError] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [medDisclaimerChecked, setMedDisclaimerChecked] = useState(false);

  const lovedOneNameRef = useRef(null);
  const caregiverNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const backupPhoneRef = useRef(null);
  const emailRef = useRef(null);
  const newPinRef = useRef(null);
  const seniorUsernameRef = useRef(null);

  const { width: screenWidth } = useWindowDimensions();
  const TRACK_PAD = 32;
  const BOAT_W = 16;
  const BOAT_PX_W = Math.round(400 * BOAT_W / 110); // ~58px actual rendered width
  const BOAT_PX_H = Math.round(320 * BOAT_W / 110); // ~47px actual rendered height
  const WATERLINE_Y = Math.round(283 * BOAT_W / 110); // ~41px — bottom of hull
  const trackWidth = screenWidth - TRACK_PAD * 2;
  const boatX = useRef(new Animated.Value(TRACK_PAD - BOAT_PX_W / 2)).current;

  useEffect(() => {
    const toValue = TRACK_PAD + (slide / (TOTAL_SLIDES - 1)) * trackWidth - BOAT_PX_W / 2;
    Animated.spring(boatX, { toValue, useNativeDriver: true, tension: 80, friction: 9 }).start();
  }, [slide, trackWidth]);

  useEffect(() => {
    const map = {
      3: lovedOneNameRef,
      4: caregiverNameRef,
      6: phoneNumberRef,
      7: backupPhoneRef,
      8: emailRef,
      11: seniorUsernameRef,
      12: newPinRef,
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

  const handleEmailNext = () => {
    const trimmed = email.trim();
    if (trimmed && !trimmed.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (trimmed) setContactEmail(trimmed);
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

  // ── Boat progress bar ─────────────────────────────────────────────────────
  const ProgressBar = () => (
    <View style={{ position: "absolute", top: 10, left: 0, right: 0, height: BOAT_PX_H + 8, zIndex: 100, pointerEvents: "none" }}>
      <View style={{ position: "absolute", top: WATERLINE_Y, left: TRACK_PAD, right: TRACK_PAD, height: 3, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
      <View style={{ position: "absolute", top: WATERLINE_Y, left: TRACK_PAD, width: (slide / (TOTAL_SLIDES - 1)) * trackWidth, height: 3, backgroundColor: "rgba(255,255,255,0.45)", borderRadius: 2 }} />
      <Animated.View style={{ position: "absolute", top: 0, left: 0, transform: [{ translateX: boatX }] }}>
        <HunkyDoryLogo width={BOAT_W} color="rgba(255,255,255,0.95)" />
      </Animated.View>
    </View>
  );

  // ── Back button ────────────────────────────────────────────────────────────
  const BackBtn = () => (
    <TouchableOpacity
      onPress={back}
      style={{ position: "absolute", top: 68, left: 20, zIndex: 10, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
    >
      <Text style={{ fontSize: 15, color: "#fff", fontWeight: "600" }}>← Back</Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#071829" }}>
      <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
        <LinearGradient colors={["#071829", "#0c2d5a"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <ProgressBar />
          <BackBtn />
          <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 44 }}>It's time to board.</Text>
          <TapHint />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── Slide 1: Your loved one is safe ───────────────────────────────────────
  if (slide === 1) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0c2d5a" }}>
      <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
        <LinearGradient colors={["#0c2d5a", "#185FA5"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <ProgressBar />
          <BackBtn />
          <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 44 }}>You steer and your loved one sails.</Text>
          <TapHint />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── Slide 2: With Hunky Dory ───────────────────────────────────────────────
  if (slide === 2) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#185FA5" }}>
      <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
        <LinearGradient colors={["#185FA5", "#1a72c4"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <ProgressBar />
          <BackBtn />
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 40, maxWidth: 320 }}>
            Now you can help keep track, and make sure your loved one is taken care of.
          </Text>
          <TapHint />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── Slide 3: Loved one's name ──────────────────────────────────────────────
  if (slide === 3) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a72c4" }}>
      <LinearGradient colors={["#1a72c4", "#185FA5"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
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
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 4: Caregiver's name ──────────────────────────────────────────────
  if (slide === 4) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#185FA5" }}>
      <LinearGradient colors={["#185FA5", "#0e4d7a"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
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
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 5: Your photo ────────────────────────────────────────────────────
  if (slide === 5) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e4d7a" }}>
      <LinearGradient colors={["#0e4d7a", "#0c2d5a"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
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
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 6: Your phone number ─────────────────────────────────────────────
  if (slide === 6) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0c2d5a" }}>
      <LinearGradient colors={["#0c2d5a", "#185FA5"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
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
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 7: Backup phone number ───────────────────────────────────────────
  if (slide === 7) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#185FA5" }}>
      <LinearGradient colors={["#185FA5", "#071829"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
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
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 8: Email address ────────────────────────────────────────────────
  if (slide === 8) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#071829" }}>
      <LinearGradient colors={["#071829", "#0c2d5a"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8, lineHeight: 36 }}>
            What's your email address?
          </Text>
          <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 8, maxWidth: 300, lineHeight: 24 }}>
            We'll only use this to send you your PIN if you ever forget it.
          </Text>
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 28, maxWidth: 280, lineHeight: 20, fontStyle: "italic" }}>
            We will never share your email or use it for marketing.
          </Text>
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={(v) => { setEmail(v); setEmailError(""); }}
            onSubmitEditing={handleEmailNext}
            placeholder="your@email.com"
            placeholderTextColor="rgba(255,255,255,0.45)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ ...inputStyle, alignSelf: "center" }}
          />
          {!!emailError && (
            <Text style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12, textAlign: "center" }}>{emailError}</Text>
          )}
          <ContinueBtn active={!!email.trim()} onPress={handleEmailNext} />
          <TouchableOpacity onPress={next} style={{ marginTop: 16 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 9: Confirmation message ─────────────────────────────────────────
  if (slide === 9) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#071829" }}>
      <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
        <LinearGradient colors={["#071829", "#185FA5"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <ProgressBar />
          <BackBtn />
          <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 44, maxWidth: 320 }}>
            Relax and feel the wind in your hair.
          </Text>
          <TapHint />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── Slide 10: Peace of mind ────────────────────────────────────────────────
  if (slide === 10) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#185FA5" }}>
      <TouchableOpacity activeOpacity={1} onPress={next} style={{ flex: 1 }}>
        <LinearGradient colors={["#185FA5", "#0c2d5a"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <ProgressBar />
          <BackBtn />
          <Text style={{ fontSize: 40, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 50 }}>Everything is Hunky Dory.</Text>
          <TapHint />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── Slide 11: Create senior's username & PIN ──────────────────────────────
  if (slide === 11) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0c2d5a" }}>
      <LinearGradient colors={["#0c2d5a", "#185FA5"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
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
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 12: Create your own sign-in PIN ─────────────────────────────────
  if (slide === 12) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#185FA5" }}>
      <LinearGradient colors={["#185FA5", "#071829"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
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
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 13: Medical disclaimer ─────────────────────────────────────────
  if (slide === 13) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#071829" }}>
      <LinearGradient colors={["#071829", "#0c2d5a"]} style={{ flex: 1 }}>
        <ProgressBar />
        <BackBtn />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40, paddingTop: 116 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8, lineHeight: 36 }}>
            One more thing
          </Text>
          <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 32, maxWidth: 300, lineHeight: 24 }}>
            Please read and acknowledge the following before continuing.
          </Text>
          <TouchableOpacity
            onPress={() => setMedDisclaimerChecked(v => !v)}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, width: "100%", maxWidth: 320, marginBottom: 32, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 18 }}
          >
            <View style={{
              width: 26, height: 26, borderRadius: 6, borderWidth: 2,
              borderColor: medDisclaimerChecked ? "#fff" : "rgba(255,255,255,0.5)",
              backgroundColor: medDisclaimerChecked ? "#fff" : "transparent",
              alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0,
            }}>
              {medDisclaimerChecked && <Text style={{ fontSize: 16, color: "#071829", fontWeight: "900" }}>✓</Text>}
            </View>
            <Text style={{ flex: 1, fontSize: 15, color: "#fff", lineHeight: 24 }}>
              I understand that medication reminders in Hunky Dory are for personal family use only and do not replace professional medical advice, prescriptions, or clinical care.
            </Text>
          </TouchableOpacity>
          <ContinueBtn active={medDisclaimerChecked} onPress={next} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );

  // ── Slide 14: Subscription ────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dm ? "#0f172a" : "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ position: "relative" }}>
          <HunkyDoryBanner bgColor="#185FA5" />
          <BackBtn />
          <LinearGradient colors={["#185FA5", "#0c2d5a"]} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 6 }}>Hunky Dory Premium</Text>
            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 24, textAlign: "center" }}>
              Keep {lovedOneName || "your loved one"} safe — free for 3 days.
            </Text>
          </LinearGradient>
        </View>

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
