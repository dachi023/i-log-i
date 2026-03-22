import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

type GlassStyle = "regular" | "clear";

type GlassBackgroundProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  glassStyle?: GlassStyle;
  blurIntensity?: number;
};

const hasLiquidGlass = isGlassEffectAPIAvailable();

export function GlassBackground({
  children,
  style,
  glassStyle = "clear",
  blurIntensity = 80,
}: GlassBackgroundProps) {
  if (hasLiquidGlass) {
    return (
      <GlassView style={style} glassEffectStyle={glassStyle} colorScheme="light">
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView style={style} intensity={blurIntensity} tint="systemChromeMaterialLight">
      {children}
    </BlurView>
  );
}
