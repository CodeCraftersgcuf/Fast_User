import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Loader: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#800080" />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
