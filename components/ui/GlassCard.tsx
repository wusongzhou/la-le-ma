import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.cardContainer, style]}>
      <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
        <View style={[styles.cardContent, isDark && styles.cardContentDark]}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  blur: {
    flex: 1,
  },
  cardContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardContentDark: {
    backgroundColor: 'rgba(30, 30, 50, 0.3)',
  },
});
