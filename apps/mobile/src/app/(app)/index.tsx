import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthContext } from "@loretto/firebase-config";

export default function HomeScreen() {
  const { user, claims, signOut } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.name}>{user?.displayName ?? "Parent"}</Text>
      <Text style={styles.role}>Role: {claims?.role}</Text>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
