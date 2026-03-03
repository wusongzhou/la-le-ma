import { Text, TextProps } from 'react-native';
import { Colors, FontFamily } from './theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  // Use handwriting style for Chinese
  handwritten?: boolean;
}

export function Typography({ children, variant = 'body', style, handwritten = true, ...props }: TypographyProps) {
  const variantStyles = {
    h1: {
      fontSize: 36,
      fontWeight: '800' as const,
      letterSpacing: -0.5,
      color: Colors.text.primary,
      fontFamily: handwritten ? FontFamily.regular : FontFamily.system,
    },
    h2: {
      fontSize: 26,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      color: Colors.text.primary,
      fontFamily: handwritten ? FontFamily.regular : FontFamily.system,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: Colors.text.primary,
      fontFamily: handwritten ? FontFamily.regular : FontFamily.system,
    },
    body: {
      fontSize: 16,
      fontWeight: '500' as const,
      color: Colors.text.primary,
      fontFamily: handwritten ? FontFamily.regular : FontFamily.system,
    },
    caption: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: Colors.text.secondary,
      fontFamily: handwritten ? FontFamily.regular : FontFamily.system,
    },
  };

  return (
    <Text style={[variantStyles[variant], style]} {...props}>
      {children}
    </Text>
  );
}
