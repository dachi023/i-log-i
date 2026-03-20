---
name: native-frontend-design
description: Create distinctive, production-grade React Native (Expo) interfaces with high design quality. Use this skill when the user asks to build mobile components, screens, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

This skill guides creation of distinctive, production-grade React Native interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides mobile UI requirements: a component, screen, or feature to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Platform feel**: Respect iOS/Android conventions where they matter (safe areas, navigation patterns, gesture handling) while still being visually distinctive.
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (React Native + Expo) that is:
- Production-grade and functional on both iOS and Android
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Performant (60fps animations on the UI thread)

## Native Aesthetics Guidelines

Focus on:
- **Typography**: Choose distinctive fonts loaded via `expo-font` or `expo-google-fonts`. Avoid system defaults; opt for characterful choices that elevate the design. Pair a distinctive display font with a refined body font. Always handle font loading states gracefully with `useFonts` or `SplashScreen.preventAutoHideAsync()`.
- **Color & Theme**: Commit to a cohesive aesthetic. Use a theme object or React Context for consistency across screens. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Support light/dark mode via `useColorScheme()` when appropriate.
- **Motion**: Use `react-native-reanimated` for performant UI-thread animations. Use `Moti` for declarative animation patterns when available. Focus on high-impact moments: screen transitions with staggered reveals, shared element transitions, and layout animations. Use `Pressable` with animated feedback (scale, opacity, color shifts) for delightful touch interactions. Consider `expo-haptics` for tactile feedback on key interactions.
- **Spatial Composition**: Leverage Flexbox creatively. Use `position: absolute` for overlapping elements, layered compositions, and breaking out of linear flow. Combine `zIndex`, transforms (`rotate`, `skew`, `scale`), and negative margins for dynamic layouts. Generous padding OR controlled density.
- **Backgrounds & Visual Depth**: Create atmosphere and depth rather than flat solid colors. Use `expo-linear-gradient` for gradient backgrounds, `react-native-svg` for patterns and complex shapes, `expo-blur` (BlurView) for frosted glass effects, `shadow*` props (iOS) and `elevation` (Android) for depth. Layer `View` components with varying opacity for texture and dimension.

NEVER use generic AI-generated aesthetics like plain white/gray backgrounds with default system fonts, cliched color schemes (particularly purple gradients), predictable component arrangements, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics.

## Native-Specific Considerations

- **Performance**: All animations must run on the UI thread via `react-native-reanimated` worklets. Avoid `setState` in animation loops. Use `FlatList` or `FlashList` for long lists with proper `keyExtractor` and `getItemLayout`.
- **Touch targets**: Minimum 44x44pt touch targets per Apple HIG / Material Design guidelines.
- **Safe areas**: Always account for notches, dynamic islands, and home indicators using `SafeAreaView` or `useSafeAreaInsets()` from `react-native-safe-area-context`.
- **Platform adaptation**: Use `Platform.select()` or `Platform.OS` for platform-specific shadows (`shadowOffset`/`shadowRadius` on iOS, `elevation` on Android) and other divergences.
- **Images**: Use `expo-image` for performant image loading with placeholder blur hashes and transitions.
- **Gestures**: Use `react-native-gesture-handler` for complex touch interactions (swipe, pinch, long press) that feel native and responsive.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate Reanimated sequences and layered compositions. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
