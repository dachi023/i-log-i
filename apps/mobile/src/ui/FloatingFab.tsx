import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "../theme";
import { BottomBar } from "./BottomBar";

const hasLiquidGlass = isGlassEffectAPIAvailable();
export const FAB_SIZE = 52;

export function FloatingFab({ onPress }: { onPress: () => void }) {
  if (hasLiquidGlass) {
    return (
      <BottomBar style={styles.fabOnly}>
        <GlassView
          style={styles.fabGlass}
          glassEffectStyle="regular"
          colorScheme="light"
          isInteractive
        >
          <Pressable style={styles.fabInner} onPress={onPress}>
            <Ionicons name="add" size={26} color={colors.primaryDark} />
          </Pressable>
        </GlassView>
      </BottomBar>
    );
  }

  return (
    <BottomBar style={styles.fabOnly}>
      <View style={styles.fabShadow}>
        <View style={styles.fabLegacy}>
          <BlurView
            intensity={60}
            tint="systemChromeMaterialLight"
            style={StyleSheet.absoluteFill}
          />
          <Pressable style={styles.fabInner} onPress={onPress}>
            <Ionicons name="add" size={26} color={colors.primaryDark} />
          </Pressable>
        </View>
      </View>
    </BottomBar>
  );
}

const styles = StyleSheet.create({
  fabOnly: {
    justifyContent: "flex-end",
  },
  fabGlass: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  fabShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  fabLegacy: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    overflow: "hidden",
  },
  fabInner: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
