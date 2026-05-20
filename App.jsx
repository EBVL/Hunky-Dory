import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "./src/AppContext";
import RoleSelectView from "./src/views/RoleSelectView";
import SeniorSignInView from "./src/views/SeniorSignInView";
import SeniorView from "./src/views/SeniorView";
import ContactView from "./src/views/ContactView";
import ContactOnboardingView from "./src/views/ContactOnboardingView";
import ContactSignInView from "./src/views/ContactSignInView";

function Root() {
  const { isLoading, seniorLoggedIn, role, contactOnboarded, contactLoggedIn } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#EFF4F2" }}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

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
