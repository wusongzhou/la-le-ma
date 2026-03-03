import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Colors, BorderRadius } from './theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: { backgroundColor: Colors.primary },
    success: { backgroundColor: Colors.success },
    danger: { backgroundColor: Colors.danger },
    ghost: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.primary },
  };

  const textVariantStyles = {
    primary: { color: '#fff' },
    success: { color: '#fff' },
    danger: { color: '#fff' },
    ghost: { color: Colors.primary },
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 24 },
    lg: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const textSizeStyles = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={[styles.text, textVariantStyles[variant], textSizeStyles[size]]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
});
