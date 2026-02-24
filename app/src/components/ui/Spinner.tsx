import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {colors} from '../../lib/theme';

type Props = {
  size?: 'small' | 'large';
  fullScreen?: boolean;
};

export default function Spinner({size = 'large', fullScreen = false}: Props) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={colors.accentMint} />
      </View>
    );
  }
  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={colors.accentMint} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
  },
  inline: {
    padding: 20,
    alignItems: 'center',
  },
});
