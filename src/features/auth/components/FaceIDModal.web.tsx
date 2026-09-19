// ============================================================
// FaceIDModal.web.tsx – Xác thực sinh trắc học Face ID (Phiên bản Web)
// Mô phỏng quét sinh trắc học chuẩn UI chính phủ, an toàn tuyệt đối trên trình duyệt
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';

interface FaceIDModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const FaceIDModalWeb: React.FC<FaceIDModalProps> = ({ visible, onClose, onAuthSuccess }) => {
  const [status, setStatus] = useState('Khởi tạo máy quét khuôn mặt...');
  const [success, setSuccess] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStatus('Khởi tạo máy quét khuôn mặt...');
      setSuccess(false);
      scanAnim.setValue(0);

      // Bắt đầu hiệu ứng quét tia laser lên xuống
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();

      // Tiến trình nhận diện sinh trắc học
      const t1 = setTimeout(() => {
        setStatus('Đang khớp dữ liệu sinh trắc học công dân...');
      }, 900);

      const t2 = setTimeout(() => {
        setStatus('Xác thực danh tính thành công!');
        setSuccess(true);
      }, 1900);

      const t3 = setTimeout(() => {
        onAuthSuccess();
      }, 2500);

      return () => {
        loop.stop();
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [visible, scanAnim, onAuthSuccess]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>XÁC THỰC SINH TRẮC HỌC</Text>
          <Text style={styles.subtitle}>Giữ thẳng vị trí trước camera để hệ thống CIVIL-PRO nhận diện</Text>

          {/* Circular scanning viewport */}
          <View style={styles.scannerOuter}>
            <View style={[styles.scannerInner, success && styles.scannerSuccess]}>
              <MaterialCommunityIcons
                name={success ? 'face-recognition' : 'scan-helper'}
                size={88}
                color={success ? '#16a34a' : Colors.primary}
              />

              {/* Horizontal scan laser */}
              {!success && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY }] },
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
    </Modal>
  );
};

export default FaceIDModalWeb;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  scannerOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: 'rgba(218, 37, 29, 0.2)',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f8fafc',
  },
  scannerInner: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#e2e8f0',
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
    height: 3,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusSuccessText: {
    color: '#16a34a',
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
