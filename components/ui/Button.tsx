import { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Colors, DoodleShadows, FontFamily } from './theme';

interface DoodleButtonProps {
  isRunning: boolean;
  onPress: () => void;
  size?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function DoodleButton({ isRunning, onPress, size = 160 }: DoodleButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const dynamicStyles = useMemo(() => {
    const bgColor = isRunning ? Colors.pink : Colors.mint;
    const borderColor = isRunning ? Colors.border.pink : Colors.border.mint;
    const textColor = isRunning ? Colors.text.pink : Colors.text.mint;

    return {
      container: {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        borderWidth: 4,
        borderColor: borderColor,
        ...DoodleShadows.floating,
      },
      inner: {
        borderRadius: size / 2 - 8,
        borderWidth: 2,
        borderColor: borderColor,
        opacity: 0.5,
      },
      textColor,
    };
  }, [size, isRunning]);

  return (
    <AnimatedTouchable
      style={[styles.container, dynamicStyles.container, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={[styles.inner, dynamicStyles.inner]}>
        <Text style={styles.emoji}>{isRunning ? '💩' : '🚽'}</Text>
        <Text style={[styles.text, { color: dynamicStyles.textColor }]}>
          {isRunning ? '结束' : '开始'}
        </Text>
      </View>
      {/* Decorative doodles */}
      <View style={[styles.doodle1, { backgroundColor: isRunning ? Colors.sketch.pink : Colors.sketch.mint }]} />
      <View style={[styles.doodle2, { backgroundColor: isRunning ? Colors.sketch.pink : Colors.sketch.mint }]} />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  text: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: FontFamily.regular,
  },
  doodle1: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.5,
    borderWidth: 2,
    borderColor: Colors.sketch.dark,
  },
  doodle2: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
});
