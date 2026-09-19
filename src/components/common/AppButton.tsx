// ============================================================
// AppButton – Reusable button
// Dùng lại ở mọi nơi trong app
// ============================================================

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';

type Variant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps {
  label      : string;
  onPress    : () => void;
  variant   ?: Variant;
  loading   ?: boolean;
  loadingText?: string;
  disabled  ?: boolean;
  style     ?: StyleProp<ViewStyle>;
  textStyle ?: StyleProp<TextStyle>;
  rightIcon ?: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant     = 'primary',
  loading     = false,
  loadingText,
  disabled    = false,
  style,
  textStyle,
  rightIcon,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator
            color={variant === 'primary' ? Colors.textOnPrimary : Colors.primary}
            size="small"
          />
          {loadingText ? (
            <Text style={[styles.label, styles[`${variant}Label`], textStyle, styles.loadingLabel]}>
              {loadingText}
            </Text>
          ) : null}
        </View>
      ) : (
        <>
          <Text style={[styles.label, styles[`${variant}Label`], textStyle]}>
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection    : 'row',
    alignItems       : 'center',
    justifyContent   : 'center',
    gap              : 10,
    height           : 56,
    borderRadius     : 16,
    paddingHorizontal: 24,
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    shadowColor    : Colors.shadowPrimary,
    shadowOffset   : { width: 0, height: 6 },
    shadowOpacity  : 0.5,
    shadowRadius   : 12,
    elevation      : 6,
  },
  secondary: {
    backgroundColor: Colors.bgInput,
    borderWidth    : 1,
    borderColor    : Colors.border,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },

  // Disabled
  disabled: {
    opacity: 0.55,
  },

  // Labels
  label: {
    fontSize  : 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryLabel: {
    color: Colors.textOnPrimary,
  },
  secondaryLabel: {
    color: Colors.textPrimary,
  },
  ghostLabel: {
    color: Colors.primary,
  },
  loadingRow: {
    flexDirection : 'row',
    alignItems    : 'center',
    justifyContent: 'center',
    gap           : 10,
  },
  loadingLabel: {
    fontSize     : 14,
    fontWeight   : '600',
    letterSpacing: 0.3,
  },
} as const);
