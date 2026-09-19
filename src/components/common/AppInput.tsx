import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';

interface AppInputProps extends TextInputProps {
  label        ?: string;
  leftIcon     ?: React.ReactNode;
  rightAction  ?: React.ReactNode;
  error        ?: string;
  containerStyle?: ViewStyle;
}

const AppInput: React.FC<AppInputProps> = ({
  label,
  leftIcon,
  rightAction,
  error,
  containerStyle,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure]   = useState(secureTextEntry ?? false);
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {(label || rightAction) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {rightAction}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          !!error   && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            Platform.OS === 'web' && ({
              outline: 'none',
              backgroundColor: 'transparent',
            } as any),
          ]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={rest.autoComplete ?? 'off'}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setIsSecure(prev => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleText}>{isSecure ? 'Hiện' : 'Ẩn'}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default AppInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
  },
  labelRow: {
    flexDirection : 'row',
    justifyContent: 'space-between',
    alignItems    : 'center',
    marginBottom  : 8,
  },
  label: {
    fontSize     : 10,
    fontFamily   : 'BeVietnamPro-Bold',
    color        : Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection    : 'row',
    alignItems       : 'center',
    backgroundColor  : Colors.bgInput,
    borderWidth      : 1.5,
    borderColor      : Colors.border,
    borderRadius     : 16,
    paddingHorizontal: 16,
    height           : 56,
  },
  inputFocused: {
    borderColor    : Colors.borderFocus,
    backgroundColor: Colors.bgScreen,
    shadowColor    : Colors.borderFocus,
    shadowOffset   : { width: 0, height: 0 },
    shadowOpacity  : 0.2,
    shadowRadius   : 8,
    elevation      : 3,
  },
  inputError: {
    borderColor    : Colors.dangerIcon,
    backgroundColor: Colors.dangerBg,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex           : 1,
    height         : '100%',
    fontSize       : 15,
    fontFamily     : 'BeVietnamPro-Regular',
    color          : Colors.textPrimary,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  rightIcon: {
    marginLeft: 8,
  },
  toggleText: {
    fontSize  : 12,
    fontFamily: 'BeVietnamPro-SemiBold',
    color     : Colors.primary,
  },
  errorText: {
    marginTop : 6,
    fontSize  : 12,
    fontFamily: 'BeVietnamPro-Regular',
    color     : Colors.dangerIcon,
  },
});