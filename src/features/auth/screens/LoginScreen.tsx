import React, { memo, useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';

import { useLogin } from '../hooks/useLogin';
import RoleSelector from '../components/RoleSelector';
import LoginForm from '../components/LoginForm';
import SecurityModal from '../components/SecurityModal';
import FaceIDModal from '../components/FaceIDModal';
import AppButton from '../../../components/common/AppButton';
import ErrorToast from '../../../components/common/ErrorToast';
import { loginStyles as S } from '../styles/login.styles';

const { width: windowWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && windowWidth >= 768;

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

const BrandIdentity = ({ isWebVersion = false }) => (
  <View style={isWebVersion ? S.webBrandRow : S.brandRow}>
    <View style={isWebVersion ? S.webBrandIconBox : S.brandIconBox}>
      <Image 
        source={require('../../../assets/images/logo1.png')}
        style={isWebVersion ? S.webBrandImage : S.brandImage} 
        resizeMode="contain"
      />
    </View>
    <Text style={isWebVersion ? S.webBrandName : S.brandName}>CIVIL-PRO</Text>
  </View>
);

/**
 * Thanh tiến trình hiệu ứng phát sáng mượt mà chạy ngang đỉnh card khi đang đăng nhập
 */
const CardLoadingBar = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-250, 700],
  });

  return (
    <View style={screenStyles.loadingTrack}>
      <Animated.View
        style={[
          screenStyles.loadingBeam,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const {
    username, password, role, agreedToTerms,
    isLoading, showModal,
    usernameError, passwordError, errorMessage,
    setUsername, setPassword, setRole, setAgreedToTerms,
    clearError,
    handleSubmit, handleFaceIdLogin, handleModalClose,
  } = useLogin(onLoginSuccess);

  const [showFaceIdModal, setShowFaceIdModal] = useState(false);

  return (
    <View style={{ flex: 1, minHeight: isWeb ? ('100vh' as any) : '100%' }}>
      <Image 
        source={require('../../../assets/images/07b0b6f5dd3ede3a4b8a18962e91f070.jpg')} 
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
        resizeMode="cover"
      />
      <SafeAreaView style={[S.safeArea, { backgroundColor: 'transparent' }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[S.scrollContent, { backgroundColor: 'transparent' }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={S.card}>
              {/* Hiệu ứng loading chạy mượt mà trên đỉnh card khi đăng nhập */}
              {isLoading && <CardLoadingBar />}

              <View style={S.leftPanel}>
                <View style={S.leftPanelTop}>
                  <BrandIdentity />
                  <Text style={S.headerTitle}>
                    Hệ thống Cơ sở dữ liệu{'\n'}Dân cư & Hộ khẩu Toàn tỉnh
                  </Text>
                  <Text style={S.headerSubtitle}>
                    Nền tảng quản lý thông tin dân cư hiện đại, kết nối liên thông toàn quốc.
                  </Text>
                </View>
              </View>

              <View style={S.headerBanner}>
                <BrandIdentity />
                <Text style={S.headerTitle}>
                  Hệ thống Cơ sở dữ liệu{'\n'}Dân cư & Hộ khẩu Toàn tỉnh
                </Text>
                <Text style={S.headerSubtitle}>
                  Nền tảng quản lý thông tin dân cư hiện đại, kết nối liên thông.
                </Text>
              </View>

              <View style={S.formArea}>
                <BrandIdentity isWebVersion />

                <View>
                  <Text style={S.formTitle}>Đăng nhập hệ thống</Text>
                  <Text style={S.formSubtitle}>
                    Vui lòng sử dụng tài khoản cán bộ đã được cấp.
                  </Text>
                </View>

                <RoleSelector selected={role} onChange={setRole} />

                <LoginForm
                  username={username}
                  password={password}
                  agreedToTerms={agreedToTerms}
                  onUsernameChange={setUsername}
                  onPasswordChange={setPassword}
                  onTermsChange={setAgreedToTerms}
                  usernameError={usernameError}
                  passwordError={passwordError}
                />

                {!isDesktop ? (
                  <View style={S.actionRow}>
                    <AppButton
                      label="VÀO HỆ THỐNG"
                      onPress={handleSubmit}
                      loading={isLoading}
                      loadingText="Đang xác thực hệ thống..."
                      style={[S.submitBtn, { flex: 1 }]}
                      rightIcon={<Text style={{ color: '#fff', fontSize: 16 }}>→</Text>}
                    />
                    <TouchableOpacity
                      style={S.faceIdBtn}
                      onPress={() => setShowFaceIdModal(true)}
                      activeOpacity={0.8}
                      disabled={isLoading}
                    >
                      <MaterialCommunityIcons
                        name="face-recognition"
                        size={28}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <AppButton
                    label="VÀO HỆ THỐNG"
                    onPress={handleSubmit}
                    loading={isLoading}
                    loadingText="Đang xác thực hệ thống..."
                    style={S.submitBtn}
                    rightIcon={<Text style={{ color: '#fff', fontSize: 16 }}>→</Text>}
                  />
                )}

                <View style={S.supportSection}>
                  <Text style={S.supportTitle}>Hỗ trợ kỹ thuật 24/7</Text>
                  <View style={S.supportRow}>
                    <SupportItem icon="📞" text="1900 8888" />
                    <SupportItem icon="✉️" text="hotro@chinhphu.vn" />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SecurityModal visible={showModal} onClose={handleModalClose} />
      {showFaceIdModal && (
        <FaceIDModal
          visible={showFaceIdModal}
          onClose={() => setShowFaceIdModal(false)}
          onAuthSuccess={() => {
            setShowFaceIdModal(false);
            handleFaceIdLogin();
          }}
        />
      )}

      {/* Toast lỗi đăng nhập – hiện phía trên màn hình */}
      <ErrorToast
        message={errorMessage}
        onDismiss={clearError}
      />
    </View>
  );
};

const SupportItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={S.supportItem}>
    <Text style={S.supportIcon}>{icon}</Text>
    <Text style={S.supportText}>{text}</Text>
  </View>
);

const screenStyles = StyleSheet.create({
  loadingTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: 'rgba(218, 37, 29, 0.15)',
    overflow: 'hidden',
    zIndex: 999,
  },
  loadingBeam: {
    width: '45%',
    height: '100%',
    backgroundColor: Colors.accent, // Màu vàng sao cờ nổi bật
    borderRadius: 2,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default memo(LoginScreen);