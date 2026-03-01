import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  // AuthGate in _layout.tsx handles routing to (auth) or (app)
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
