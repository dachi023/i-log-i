import { Redirect } from "expo-router";
import { useStore } from "../data/store";

export default function Index() {
  const { isAuthenticated, isOnboarded } = useStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (!isOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(drawer)" />;
}
