// ============================================================
// AI API KEY MODAL – Cấu hình Gemini / OpenAI API Key
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../services/ai.service';

interface AiApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const AiApiKeyModal: React.FC<AiApiKeyModalProps> = ({
  visible,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      const stored = getStoredApiKey();
      setApiKey(stored);
      setIsSaved(!!stored);
    }
  }, [visible]);

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setIsSaved(!!apiKey.trim());
    onKeySaved?.();
    onClose();
  };

  const handleClear = () => {
    clearStoredApiKey();
    setApiKey('');
    setIsSaved(false);
    onKeySaved?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Feather name="key" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Cài đặt Gemini API Key</Text>
                <Text style={styles.subtitle}>Kích hoạt trí tuệ nhân tạo cho Trợ lý Hạnh AI</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBox, isSaved ? styles.statusActive : styles.statusInactive]}>
            <Feather
              name={isSaved ? 'check-circle' : 'info'}
              size={16}
              color={isSaved ? '#16a34a' : '#ea580c'}
            />
            <Text style={[styles.statusText, { color: isSaved ? '#15803d' : '#c2410c' }]}>
              {isSaved
                ? 'Đã cấu hình API Key. Trợ lý AI đang kết nối Gemini trực tiếp.'
                : 'Chưa có API Key. Đang dùng Cơ sở tri thức Dân cư tích hợp sẵn.'}
            </Text>
          </View>

          {/* Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>GOOGLE GEMINI API KEY</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  Platform.OS === 'web' && ({ outline: 'none' } as any),
                ]}
                placeholder="Dán mã API Key của bạn (AIzaSy...)"
                placeholderTextColor={Colors.textMuted}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowKey(!showKey)}
              >
                <Feather name={showKey ? 'eye-off' : 'eye'} size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Helper Tips */}
          <View style={styles.guideBox}>
            <Text style={styles.guideTitle}>💡 Cách lấy API Key miễn phí:</Text>
            <Text style={styles.guideStep}>1. Truy cập <Text style={styles.guideLink}>Google AI Studio</Text> (aistudio.google.com).</Text>
            <Text style={styles.guideStep}>2. Đăng nhập tài khoản Google và bấm "Get API Key".</Text>
            <Text style={styles.guideStep}>3. Sao chép mã và dán vào ô phía trên rồi nhấn "Lưu API Key".</Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {isSaved && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearText}>Xóa Key</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Feather name="check" size={16} color="#fff" />
              <Text style={styles.saveText}>Lưu API Key</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex           : 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent : 'center',
    alignItems     : 'center',
    padding        : 20,
    zIndex         : 99999,
  },
  modalCard: {
    width          : '100%',
    maxWidth       : 500,
    backgroundColor: Colors.white,
    borderRadius   : 20,
    padding        : 24,
    shadowColor    : '#000',
    shadowOffset   : { width: 0, height: 12 },
    shadowOpacity  : 0.25,
    shadowRadius   : 24,
    elevation      : 16,
    gap            : 18,
  },
  header: {
    flexDirection : 'row',
    justifyContent: 'space-between',
    alignItems    : 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems   : 'center',
    gap          : 12,
  },
  iconCircle: {
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    backgroundColor: Colors.primaryLight,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  title: {
    fontSize  : 17,
    fontFamily: 'BeVietnamPro-Bold',
    color     : Colors.textPrimary,
  },
  subtitle: {
    fontSize  : 12,
    fontFamily: 'BeVietnamPro-Regular',
    color     : Colors.textSecondary,
    marginTop : 2,
  },
  closeBtn: {
    padding: 6,
  },
  statusBox: {
    flexDirection    : 'row',
    alignItems       : 'center',
    gap              : 10,
    paddingHorizontal: 14,
    paddingVertical  : 10,
    borderRadius     : 12,
  },
  statusActive: {
    backgroundColor: '#f0fdf4',
    borderWidth    : 1,
    borderColor    : '#bbf7d0',
  },
  statusInactive: {
    backgroundColor: '#fff7ed',
    borderWidth    : 1,
    borderColor    : '#fed7aa',
  },
  statusText: {
    fontSize  : 12.5,
    fontFamily: 'BeVietnamPro-Medium',
    flex      : 1,
  },
  fieldGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize     : 11,
    fontFamily   : 'BeVietnamPro-Bold',
    color        : Colors.textMuted,
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection    : 'row',
    alignItems       : 'center',
    backgroundColor  : Colors.bgInput,
    borderWidth      : 1.5,
    borderColor      : Colors.border,
    borderRadius     : 14,
    paddingHorizontal: 14,
    height           : 48,
  },
  input: {
    flex      : 1,
    fontSize  : 14,
    fontFamily: 'BeVietnamPro-Regular',
    color     : Colors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  guideBox: {
    backgroundColor: '#f8fafc',
    borderRadius   : 12,
    padding        : 14,
    borderWidth    : 1,
    borderColor    : '#e2e8f0',
    gap            : 4,
  },
  guideTitle: {
    fontSize  : 12.5,
    fontFamily: 'BeVietnamPro-Bold',
    color     : Colors.textPrimary,
    marginBottom: 2,
  },
  guideStep: {
    fontSize  : 11.5,
    fontFamily: 'BeVietnamPro-Regular',
    color     : Colors.textSecondary,
    lineHeight: 18,
  },
  guideLink: {
    fontFamily: 'BeVietnamPro-Bold',
    color     : Colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems   : 'center',
    gap          : 12,
    marginTop    : 4,
  },
  clearBtn: {
    paddingVertical  : 10,
    paddingHorizontal: 14,
    borderRadius     : 10,
    backgroundColor  : '#fee2e2',
  },
  clearText: {
    fontSize  : 13,
    fontFamily: 'BeVietnamPro-Bold',
    color     : Colors.dangerIcon,
  },
  cancelBtn: {
    paddingVertical  : 10,
    paddingHorizontal: 16,
    borderRadius     : 12,
    backgroundColor  : Colors.bgInput,
  },
  cancelText: {
    fontSize  : 13,
    fontFamily: 'BeVietnamPro-Medium',
    color     : Colors.textSecondary,
  },
  saveBtn: {
    flexDirection    : 'row',
    alignItems       : 'center',
    gap              : 6,
    paddingVertical  : 10,
    paddingHorizontal: 18,
    borderRadius     : 12,
    backgroundColor  : Colors.primary,
    shadowColor      : Colors.primary,
    shadowOffset     : { width: 0, height: 4 },
    shadowOpacity    : 0.3,
    shadowRadius     : 8,
    elevation        : 4,
  },
  saveText: {
    fontSize  : 13,
    fontFamily: 'BeVietnamPro-Bold',
    color     : '#fff',
  },
});
