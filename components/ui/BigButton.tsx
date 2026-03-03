import { useMemo } from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Colors } from './theme';

interface BigButtonProps {
  isRunning: boolean;
  onPress: () => void;
  size?: number;
}

export function BigButton({ isRunning, onPress, size = 160 }: BigButtonProps) {
  const dynamicStyles = useMemo(
    () => ({
      container: { width: size, height: size, borderRadius: size / 2 },
      blur: { borderRadius: size / 2 },
      inner: {
        borderRadius: size / 2,
        backgroundColor: isRunning ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
      },
      text: { color: isRunning ? Colors.danger : Colors.success },
    }),
    [size, isRunning]
  );

  return (
    <TouchableOpacity
      style={[styles.container, dynamicStyles.container]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <BlurView intensity={40} tint="light" style={[styles.blur, dynamicStyles.blur]}>
        <View style={[styles.inner, dynamicStyles.inner]}>
          <Text style={styles.emoji}>{isRunning ? '💩' : '🚽'}</Text>
          <Text style={[styles.text, dynamicStyles.text]}>{isRunning ? '结束' : '开始'}</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
  },
});
