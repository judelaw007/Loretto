import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthContext } from "@loretto/firebase-config";

export default function UnauthorizedScreen() {
  const { signOut } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.message}>
        Your account does not have permission to access the Parent App.
      </Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4b5563",
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
