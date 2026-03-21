import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated } from "react-native";

type DrawerContextType = {
  /** Whether the drawer panel is visible (includes during gesture) */
  visible: boolean;
  setVisible: (value: boolean) => void;
  /** Animate open/close */
  openDrawer: () => void;
  closeDrawer: () => void;
  /** 0 = fully open, DRAWER_WIDTH = fully closed */
  slideAnim: Animated.Value;
  /** 0 = no overlay, 1 = full overlay */
  overlayAnim: Animated.Value;
};

export const DRAWER_WIDTH = 280;

const DrawerContext = createContext<DrawerContextType>({
  visible: false,
  setVisible: () => {},
  openDrawer: () => {},
  closeDrawer: () => {},
  slideAnim: new Animated.Value(DRAWER_WIDTH),
  overlayAnim: new Animated.Value(0),
});

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, overlayAnim]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [slideAnim, overlayAnim]);

  const value = useMemo(
    () => ({ visible, setVisible, openDrawer, closeDrawer, slideAnim, overlayAnim }),
    [visible, openDrawer, closeDrawer, slideAnim, overlayAnim],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useDrawer() {
  return useContext(DrawerContext);
}
