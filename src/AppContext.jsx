import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const ls = async (key, val) => AsyncStorage.setItem(key, val);
const lg = async (key) => AsyncStorage.getItem(key);

export const parseTimeStr = (str) => {
  if (!str) return new Date();
  const [timePart, period] = str.split(" ");
  let [h, m] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export function AppProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRoleRaw] = useState(null);
  const [seniorLoggedIn, setSeniorLoggedIn] = useState(false);
  const [contactLoggedIn, setContactLoggedIn] = useState(false);
  const [contactOnboarded, setContactOnboarded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isPaid, setIsPaidRaw] = useState(false);
  const [isPaired, setIsPaired] = useState(false);
  const [seniorUsername, setSeniorUsername] = useState("");
  const [seniorPin, setSeniorPin] = useState("");
  const [seniorName, setSeniorName] = useState("your loved one");
  const [contactNameState, setContactNameRaw] = useState("");
  const [contactPhoto, setContactPhotoState] = useState(null);
  const [contactLoginPin, setContactLoginPinRaw] = useState("");
  const [contactPhone, setContactPhoneRaw] = useState("");
  const [contactBackupPhone, setContactBackupPhoneRaw] = useState("");
  const [takenUsernames, setTakenUsernames] = useState([]);

  const [checkedInToday, setCheckedInToday] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [checkInSchedule, setCheckInSchedule] = useState([]);
  const [completedCheckIns, setCompletedCheckIns] = useState([]);

  const [showerStatus, setShowerStatus] = useState(null);
  const [showerInTime, setShowerInTime] = useState(null);
  const [showerDuration, setShowerDuration] = useState(null);

  const [medications, setMedications] = useState([]);
  const [mealCount, setMealCount] = useState(0);
  const [activityLog, setActivityLog] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [customMsg, setCustomMsg] = useState("");
  const [contactTab, setContactTab] = useState("dashboard");
  const [sosAlert, setSosAlert] = useState(null);
  const [editingMed, setEditingMed] = useState(null);
  const [newMedForm, setNewMedForm] = useState({ name: "", time: "8:00 AM" });
  const [showAddMed, setShowAddMed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          seniorIn, dark, paid, uname, pin, sName, cName, schedule, meds,
          contactIn, contactOnb, cPhoto, mCount, taken,
          paired, cLoginPin, cPhone, cBackupPhone, storedRole,
        ] = await Promise.all([
          lg("bh_senior_in"),
          lg("bh_dark"),
          lg("bh_paid"),
          lg("bh_username"),
          lg("bh_pin"),
          lg("bh_senior_name"),
          lg("bh_contact_name"),
          lg("bh_schedule"),
          lg("bh_medications"),
          lg("bh_contact_in"),
          lg("bh_contact_onboarded"),
          lg("bh_contact_photo"),
          lg("bh_meal_count"),
          lg("bh_taken_usernames"),
          lg("bh_paired"),
          lg("bh_contact_login_pin"),
          lg("bh_contact_phone"),
          lg("bh_contact_backup_phone"),
          lg("bh_role"),
        ]);
        if (seniorIn === "1") setSeniorLoggedIn(true);
        if (dark === "1") setDarkMode(true);
        if (paid === "1") setIsPaidRaw(true);
        if (uname) setSeniorUsername(uname);
        if (pin) setSeniorPin(pin);
        if (sName) setSeniorName(sName);
        if (cName) setContactNameRaw(cName);
        if (schedule) setCheckInSchedule(JSON.parse(schedule));
        if (meds) setMedications(JSON.parse(meds));
        if (contactIn === "1") setContactLoggedIn(true);
        if (contactOnb === "1") setContactOnboarded(true);
        if (cPhoto) setContactPhotoState(cPhoto);
        if (mCount) setMealCount(parseInt(mCount, 10));
        if (taken) setTakenUsernames(JSON.parse(taken));
        if (paired === "1") setIsPaired(true);
        if (cLoginPin) setContactLoginPinRaw(cLoginPin);
        if (cPhone) setContactPhoneRaw(cPhone);
        if (cBackupPhone) setContactBackupPhoneRaw(cBackupPhone);
        if (storedRole) setRoleRaw(storedRole);
      } catch {}
      setIsLoading(false);
    };
    load();
  }, []);

  const today = () =>
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const setRole = (r) => {
    setRoleRaw(r);
    if (r) ls("bh_role", r);
    else AsyncStorage.removeItem("bh_role");
  };

  const doSeniorLogin = () => {
    setSeniorLoggedIn(true);
    ls("bh_senior_in", "1");
  };

  const seniorSignOut = () => {
    setSeniorLoggedIn(false);
    AsyncStorage.removeItem("bh_senior_in");
  };

  const contactSignOut = () => {
    setContactLoggedIn(false);
    AsyncStorage.removeItem("bh_contact_in");
  };

  // Full reset — goes back to role selection
  const signOut = () => {
    setRoleRaw(null);
    setIsPaired(false);
    setSeniorLoggedIn(false);
    setContactLoggedIn(false);
    AsyncStorage.removeItem("bh_senior_in");
    AsyncStorage.removeItem("bh_contact_in");
    AsyncStorage.removeItem("bh_paired");
    AsyncStorage.removeItem("bh_role");
  };

  const doContactOnboard = (staySignedIn = true) => {
    setContactOnboarded(true);
    setContactLoggedIn(true);
    setIsPaired(true);
    ls("bh_contact_onboarded", "1");
    ls("bh_paired", "1");
    if (staySignedIn) ls("bh_contact_in", "1");
  };

  // Returns true if PIN matches (or no PIN set yet for legacy accounts)
  const doContactLogin = (pin, staySignedIn = false) => {
    if (contactLoginPin && pin !== contactLoginPin) return false;
    setContactLoggedIn(true);
    if (staySignedIn) ls("bh_contact_in", "1");
    return true;
  };

  const setContactCredentials = (username, pin) => {
    setContactLoginPinRaw(pin);
    ls("bh_contact_login_pin", pin);
  };

  const setContactPhone = (phone) => {
    setContactPhoneRaw(phone);
    ls("bh_contact_phone", phone);
  };

  const setContactBackupPhone = (phone) => {
    setContactBackupPhoneRaw(phone);
    ls("bh_contact_backup_phone", phone);
  };

  const isUsernameTaken = (username) => {
    const lower = username.trim().toLowerCase();
    // Taken if it's in the list AND it's not the currently set username (allowing re-save of same)
    return takenUsernames.includes(lower) && lower !== seniorUsername;
  };

  const toggleDarkMode = () => {
    setDarkMode((d) => {
      ls("bh_dark", d ? "0" : "1");
      return !d;
    });
  };

  const setIsPaid = (val) => {
    setIsPaidRaw(val);
    ls("bh_paid", val ? "1" : "0");
  };

  const setCredentials = (username, pin) => {
    const lower = username.trim().toLowerCase();
    setSeniorUsername(lower);
    setSeniorPin(pin);
    ls("bh_username", lower);
    ls("bh_pin", pin);
    setTakenUsernames((prev) => {
      const next = [...new Set([...prev, lower])];
      ls("bh_taken_usernames", JSON.stringify(next));
      return next;
    });
  };

  const saveLovedOneName = (name) => {
    setSeniorName(name);
    ls("bh_senior_name", name);
  };

  const setContactName = (name) => {
    setContactNameRaw(name);
    ls("bh_contact_name", name);
  };

  const setContactPhoto = (uri) => {
    setContactPhotoState(uri);
    if (uri) ls("bh_contact_photo", uri);
  };

  const contactName = contactNameState || "your caregiver";

  const pairContact = (username, pin) => {
    if (
      username.trim().toLowerCase() === seniorUsername &&
      pin.trim() === seniorPin
    ) {
      setIsPaired(true);
      return true;
    }
    return false;
  };

  const addLog = (entry) => {
    setActivityLog((prev) => [
      { ...entry, id: Date.now(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ...prev,
    ]);
  };

  const doCheckIn = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCheckedInToday(true);
    setLastCheckIn(timeStr);
    const now = new Date();
    const active = checkInSchedule.find((t) => {
      const diff = now - parseTimeStr(t);
      return Math.abs(diff) <= 3600000;
    });
    if (active) setCompletedCheckIns((prev) => [...new Set([...prev, active])]);
    addLog({ type: "checkin", icon: "✅", text: "Checked in — all good!" });
  };

  const canCheckIn = checkInSchedule.length === 0 || checkInSchedule.some((t) => {
    const diff = new Date() - parseTimeStr(t);
    return Math.abs(diff) <= 3600000 && !completedCheckIns.includes(t);
  });

  const activeSlot = checkInSchedule.find((t) => {
    const diff = new Date() - parseTimeStr(t);
    return Math.abs(diff) <= 3600000;
  });

  const checkInCount = completedCheckIns.length;
  const requiredCheckIns = checkInSchedule.length;

  const addCheckInTime = (t) => {
    setCheckInSchedule((prev) => {
      const next = [...new Set([...prev, t])];
      ls("bh_schedule", JSON.stringify(next));
      return next;
    });
  };

  const removeCheckInTime = (t) => {
    setCheckInSchedule((prev) => {
      const next = prev.filter((x) => x !== t);
      ls("bh_schedule", JSON.stringify(next));
      return next;
    });
  };

  const doShowerIn = () => {
    setShowerStatus("in");
    setShowerInTime(new Date());
    setShowerDuration(null);
    addLog({ type: "shower", icon: "🚿", text: "Got in the shower" });
  };

  const doShowerOut = () => {
    const dur = showerInTime ? Math.round((new Date() - showerInTime) / 60000) : null;
    setShowerStatus("out");
    setShowerDuration(dur);
    addLog({ type: "shower", icon: "🧴", text: `Out of the shower${dur ? ` after ${dur} min` : ""}` });
  };

  const toggleMed = (id) => {
    setMedications((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m));
      ls("bh_medications", JSON.stringify(next));
      return next;
    });
    const med = medications.find((m) => m.id === id);
    if (med && !med.taken) addLog({ type: "medication", icon: "💊", text: `Took ${med.name}` });
  };

  const saveMed = (form) => {
    setMedications((prev) => {
      const next = editingMed
        ? prev.map((m) => (m.id === editingMed.id ? { ...m, ...form } : m))
        : [...prev, { id: Date.now(), ...form, taken: false }];
      ls("bh_medications", JSON.stringify(next));
      return next;
    });
  };

  const deleteMed = (id) => {
    setMedications((prev) => {
      const next = prev.filter((m) => m.id !== id);
      ls("bh_medications", JSON.stringify(next));
      return next;
    });
  };

  const addMealCount = () => {
    setMealCount((prev) => {
      const next = prev + 1;
      ls("bh_meal_count", String(next));
      addLog({ type: "meal", icon: "🍽️", text: `Had meal #${next} today` });
      return next;
    });
  };

  const sendMessage = (text) => {
    setIncomingMessage(text);
    addLog({ type: "message", icon: "💌", text: `Sent message: "${text}"` });
  };

  const dismissMessage = () => setIncomingMessage(null);

  const sendSOS = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSosAlert({ time: timeStr });
    addLog({ type: "sos", icon: "🚨", text: "SOS alert sent!" });
  };

  const dismissSOS = () => setSosAlert(null);

  return (
    <AppContext.Provider value={{
      isLoading,
      role, setRole,
      seniorLoggedIn, doSeniorLogin, seniorSignOut,
      contactLoggedIn, doContactLogin, contactSignOut,
      contactOnboarded, doContactOnboard,
      darkMode, toggleDarkMode,
      isPaid, setIsPaid,
      isPaired, pairContact,
      seniorUsername, seniorPin, setCredentials, isUsernameTaken,
      seniorName, saveLovedOneName,
      contactName, setContactName,
      contactPhoto, setContactPhoto,
      contactLoginPin, setContactCredentials,
      contactPhone, setContactPhone,
      contactBackupPhone, setContactBackupPhone,
      signOut,
      today,
      checkedInToday, lastCheckIn, checkInSchedule, completedCheckIns,
      canCheckIn, activeSlot, checkInCount, requiredCheckIns,
      doCheckIn, addCheckInTime, removeCheckInTime,
      showerStatus, showerDuration, showerInTime, doShowerIn, doShowerOut,
      medications, toggleMed, saveMed, deleteMed,
      editingMed, setEditingMed,
      newMedForm, setNewMedForm,
      showAddMed, setShowAddMed,
      mealCount, addMealCount,
      activityLog,
      incomingMessage, sendMessage, dismissMessage,
      customMsg, setCustomMsg,
      contactTab, setContactTab,
      sosAlert, sendSOS, dismissSOS,
    }}>
      {children}
    </AppContext.Provider>
  );
}
