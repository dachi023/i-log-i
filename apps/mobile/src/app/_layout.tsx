import { Stack } from "expo-router";
import { useRef } from "react";
import { Animated, PanResponder } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StoreProvider } from "../data/store";
import { DailyQuestionModal } from "../ui/DailyQuestionModal";
import { DRAWER_WIDTH, DrawerProvider, useDrawer } from "../ui/DrawerContext";
import { SideMenu } from "../ui/SideMenu";

const SWIPE_THRESHOLD = 60;

function MainContent() {
  const { visible, setVisible, slideAnim, overlayAnim } = useDrawer();

  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gs) => {
        if (visibleRef.current) return false;
        return Math.abs(gs.dx) > Math.abs(gs.dy) && gs.dx < -10;
      },
      onPanResponderGrant: () => {
        setVisible(true);
        slideAnim.setValue(DRAWER_WIDTH);
        overlayAnim.setValue(0);
      },
      onPanResponderMove: (_evt, gs) => {
        const val = Math.max(0, Math.min(DRAWER_WIDTH, DRAWER_WIDTH + gs.dx));
        slideAnim.setValue(val);
        overlayAnim.setValue(1 - val / DRAWER_WIDTH);
      },
      onPanResponderRelease: (_evt, gs) => {
        const shouldOpen = gs.dx < -SWIPE_THRESHOLD || gs.vx < -0.5;
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: shouldOpen ? 0 : DRAWER_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(overlayAnim, {
            toValue: shouldOpen ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (!shouldOpen) setVisible(false);
        });
      },
    }),
  ).current;

  const translateX = slideAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX }] }} {...panResponder.panHandlers}>
      <Stack
        screenOptions={{
          headerShown: false,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="entries/[id]" />
        <Stack.Screen name="entries/create" options={{ presentation: "modal" }} />
        <Stack.Screen name="entries/edit" options={{ presentation: "modal" }} />
        <Stack.Screen name="bot/[id]" />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      </Stack>
    </Animated.View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <DrawerProvider>
          <MainContent />
          <SideMenu />
          <DailyQuestionModal />
        </DrawerProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
