import { Slot, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme";
import { NavBar } from "../../ui/NavBar";

const pageTitles: Record<string, string> = {
  "/": "日々の記録",
  "": "日々の記録",
  "/bot": "ボット",
  "/profile": "パーソナリティ",
};

export default function DrawerLayout() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "i-log-i";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <NavBar title={title} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
