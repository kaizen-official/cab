import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, radii, fontSize, font} from '../../lib/theme';

type Color = 'mint' | 'cyan' | 'red' | 'yellow' | 'gray';

type Props = {
  label: string;
  color?: Color;
};

const palette: Record<Color, {bg: string; text: string; border: string}> = {
  mint: {
    bg: colors.accentMintMuted,
    text: colors.accentMint,
    border: 'rgba(173,255,166,0.2)',
  },
  cyan: {
    bg: colors.accentCyanMuted,
    text: colors.accentCyan,
    border: 'rgba(138,242,233,0.2)',
  },
  red: {bg: colors.redMuted, text: colors.red, border: colors.redBorder},
  yellow: {
    bg: colors.yellowMuted,
    text: colors.yellow,
    border: colors.yellowBorder,
  },
  gray: {
    bg: colors.glassBg,
    text: colors.textSecondary,
    border: colors.borderSubtle,
  },
};

export default function Badge({label, color = 'gray'}: Props) {
  const p = palette[color];
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: p.bg, borderColor: p.border},
      ]}>
      <Text style={[styles.text, {color: p.text}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: font.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
