import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, radii, fontSize, font} from '../../lib/theme';

type Props = {
  title?: string;
  message?: string;
};

export default function Empty({
  title = 'Nothing here',
  message = 'No items to display.',
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="file-tray-outline" size={28} color={colors.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: font.semibold,
    marginBottom: 4,
  },
  message: {
    color: colors.textTertiary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
