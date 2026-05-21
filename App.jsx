import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "./src/AppContext";
import { HunkyDoryLogo, HunkyDoryWordmark } from "./src/components/HunkyDoryHeader";
import RoleSelectView from "./src/views/RoleSelectView";
import SeniorSignInView from "./src/views/SeniorSignInView";
import SeniorOnboardingView from "./src/views/SeniorOnboardingView";
import SeniorView from "./src/views/SeniorView";
import ContactView from "./src/views/ContactView";
import ContactOnboardingView from "./src/views/ContactOnboardingView";
import ContactSignInView from "./src/views/ContactSignInView";

function Root() {
  const { isLoading, seniorLoggedIn, seniorAcknowledged, role, contactOnboarded, contactLoggedIn } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#185FA5", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <HunkyDoryLogo width={140} color="white" />
        <HunkyDoryWordmark width={260} color="white" />
        <Text style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, fontStyle: "italic", letterSpacing: 0.3, marginTop: 4 }}>
          sailing the seas of life together
        </Text>
      </View>
    );
  }

  if (seniorLoggedIn && !seniorAcknowledged) return <SeniorOnboardingView />;
  if (seniorLoggedIn) return <SeniorView />;
  if (!role) return <RoleSelectView />;
  if (role === "senior") return <SeniorSignInView />;
  // role === "contact"
  if (!contactOnboarded) return <ContactOnboardingView />;
  if (!contactLoggedIn) return <ContactSignInView />;
  return <ContactView />;
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <Root />
    </AppProvider>
  );
}
