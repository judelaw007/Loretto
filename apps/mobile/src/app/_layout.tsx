import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuthContext } from "@loretto/firebase-config";

function AuthGate() {
  const { firebaseUser, claims, loading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    setReady(true);

    const inAuthGroup = segments[0] === "(auth)";

    if (!firebaseUser && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (firebaseUser && inAuthGroup) {
      if (claims && claims.role !== "parent") {
        router.replace("/(auth)/unauthorized");
      } else {
        router.replace("/(app)");
      }
    } else if (firebaseUser && claims && claims.role !== "parent") {
      router.replace("/(auth)/unauthorized");
    }
  }, [firebaseUser, claims, loading, segments, router]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
