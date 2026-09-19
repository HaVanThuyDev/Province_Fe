import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';

interface FaceIDModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const { width, height } = Dimensions.get('window');

const FaceIDModal: React.FC<FaceIDModalProps> = ({ visible, onClose, onAuthSuccess }) => {
  const [status, setStatus] = useState('Khởi tạo máy quét khuôn mặt...');
  const [success, setSuccess] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (visible) {
      if (permission && !permission.granted) {
        requestPermission();
      }
      setStatus('Khởi tạo máy quét khuôn mặt...');
      setSuccess(false);
      scanAnim.setValue(0);

      // Start scanning line animation loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Timers to simulate face scanning steps
      const t1 = setTimeout(() => {
        setStatus('Đang khớp dữ liệu sinh trắc học...');
      }, 900);

      const t2 = setTimeout(() => {
        setStatus('Xác thực thành công!');
        setSuccess(true);
      }, 1900);

      const t3 = setTimeout(() => {
        onAuthSuccess();
      }, 2500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [visible, scanAnim, onAuthSuccess, permission, requestPermission]);

  // Translate scanning line position based on animation value
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160], // Height of scanning frame is 180, minus stroke height
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.blurContainer}>
          <View style={styles.card}>
            {/* Header */}
            <Text style={styles.title}>XÁC THỰC SINH TRẮC HỌC</Text>
            <Text style={styles.subtitle}>Vui lòng giữ điện thoại thẳng trước mặt để quét</Text>

            {/* Circular scanning viewport */}
            <View style={styles.scannerOuter}>
              <View style={[styles.scannerInner, success && styles.scannerSuccess]}>
                {permission?.granted ? (
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="front"
                  />
                ) : null}

                {/* Dark overlay when scanning is active over camera */}
                {permission?.granted && !success && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.15)', zIndex: 1 }]} />
                )}

                <MaterialCommunityIcons
                  name={success ? "face-recognition" : "scan-helper"}
                  size={96}
                  color={success ? '#16a34a' : (permission?.granted ? 'rgba(255, 255, 255, 0.85)' : Colors.primary)}
                  style={permission?.granted ? { position: 'absolute', zIndex: 2 } : undefined}
                />
                
                {/* Horizontal scan line */}
                {!success && (
                  <Animated.View
                    style={[
                      styles.scanLine,
                      { transform: [{ translateY }], zIndex: 3 }
                    ]}
                  />
                )}
              </View>
            </View>

            {/* Status updates */}
            <Text style={[styles.statusText, success && styles.statusSuccessText]}>
              {success ? '✓ ' : '⚡ '}{status}
            </Text>

            {/* Cancel Button */}
            {!success && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FaceIDModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // slaty glassmorphism backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.primaryDark,
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro-Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  scannerOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    backgroundColor: '#fafafa',
  },
  scannerInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  scannerSuccess: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Medium',
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  statusSuccessText: {
    color: '#16a34a',
    fontFamily: 'BeVietnamPro-Bold',
  },
  cancelBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.bgInput,
    width: '100%',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-SemiBold',
    color: Colors.textSecondary,
  },
});
