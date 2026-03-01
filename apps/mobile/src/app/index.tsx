import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loretto</Text>
      <Text style={styles.subtitle}>Parent Mobile App</Text>
      <Text style={styles.phase}>Phase 1 — Foundation</Text>
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  phase: {
    marginTop: 32,
    fontSize: 14,
    color: "#aaa",
  },
});
