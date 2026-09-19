import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppInput from '../../../components/common/AppInput';
import { Colors } from '../../../theme/colors';

interface LoginFormProps {
  username        : string;
  password        : string;
  agreedToTerms   : boolean;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTermsChange   : (v: boolean) => void;
  usernameError  ?: string;
  passwordError  ?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  agreedToTerms,
  onUsernameChange,
  onPasswordChange,
  onTermsChange,
  usernameError,
  passwordError,
}) => {
  return (
    <View style={styles.container}>
      <AppInput
        label="Tên đăng nhập"
        placeholder='mã cán bộ  '
        value={username}
        onChangeText={onUsernameChange}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        returnKeyType="next"
        autoComplete="off"
        error={usernameError}
        leftIcon={<Text style={styles.inputIcon}>👤</Text>}
      />

      <AppInput
        label="Mật khẩu"
        placeholder=''
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        returnKeyType="done"
        autoComplete="off"
        error={passwordError}
        leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
        rightAction={
          <TouchableOpacity>
            <Text style={styles.forgotLink}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        }
        containerStyle={styles.passwordContainer}
      />

      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => onTermsChange(!agreedToTerms)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
          {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.termsText}>
          Tôi cam kết tuân thủ các quy định về bảo mật dữ liệu cá nhân theo{' '}
          <Text style={styles.termsHighlight}>Nghị định 13/2023/NĐ-CP</Text>.
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputIcon: {
    fontSize: 16,
  },
  passwordContainer: {
    marginTop: 0,
  },
  forgotLink: {
    fontSize  : 12,
    fontFamily: 'BeVietnamPro-Bold',
    color     : Colors.textLink,
  },
  termsRow: {
    flexDirection  : 'row',
    alignItems     : 'flex-start',
    gap            : 12,
    paddingVertical: 4,
  },
  checkbox: {
    width          : 22,
    height         : 22,
    borderRadius   : 6,
    borderWidth    : 2,
    borderColor    : Colors.border,
    backgroundColor: Colors.bgInput,
    alignItems     : 'center',
    justifyContent : 'center',
    marginTop      : 1,
    flexShrink     : 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor    : Colors.primary,
  },
  checkmark: {
    color     : Colors.white,
    fontSize  : 13,
    fontFamily: 'BeVietnamPro-Bold',
  },
  termsText: {
    flex      : 1,
    fontSize  : 13,
    fontFamily: 'BeVietnamPro-Regular',
    color     : Colors.textSecondary,
    lineHeight: 20,
  },
  termsHighlight: {
    color     : Colors.textPrimary,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
});