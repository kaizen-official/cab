import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {colors, radii, fontSize, font} from '../../lib/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const variantStyles: Record<Variant, {bg: string; text: string; border?: string}> = {
  primary: {bg: colors.accentMint, text: '#000'},
  secondary: {bg: colors.bgSurface, text: colors.textPrimary, border: colors.borderDefault},
  ghost: {bg: 'transparent', text: colors.textSecondary},
  danger: {bg: colors.redMuted, text: colors.red, border: colors.redBorder},
};

const sizeStyles: Record<Size, {py: number; px: number; fs: number}> = {
  sm: {py: 8, px: 16, fs: fontSize.sm},
  md: {py: 12, px: 20, fs: fontSize.base},
  lg: {py: 16, px: 24, fs: fontSize.lg},
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: Props) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          borderColor: v.border || 'transparent',
          borderWidth: v.border ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#000' : colors.textPrimary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {color: v.text, fontSize: s.fs},
            textStyle,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: font.semibold,
    textAlign: 'center',
  },
});
