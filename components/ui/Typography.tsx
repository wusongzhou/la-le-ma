import { StyleSheet, Text, TextProps } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from './theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
}

export function Typography({ children, variant = 'body', style, ...props }: TypographyProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const variantStyles = {
    h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '600' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 14, fontWeight: '400' as const, color: Colors.text.secondary },
  };

  const textColor = isDark ? Colors.text.light : Colors.text.primary;

  return (
    <Text
      style={[
        { color: textColor },
        variantStyles[variant],
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}