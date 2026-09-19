// ============================================================
// AI AGENT WIDGET – Trợ lý ảo Hạnh AI CIVIL-PRO
// Floating action button + Modern glassmorphic chat window
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import { ChatMessage, QuickPrompt } from '../types/ai.types';
import { sendMessageToAi, getStoredApiKey } from '../services/ai.service';
import { AiApiKeyModal } from './AiApiKeyModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = SCREEN_WIDTH < 600;

const QUICK_PROMPTS: QuickPrompt[] = [
  { id: '1', icon: '🔍', label: 'Tra cứu công dân', query: 'Hướng dẫn tra cứu thông tin công dân trên hệ thống' },
  { id: '2', icon: '📋', label: 'Đăng ký thường trú', query: 'Thủ tục và hồ sơ đăng ký thường trú mới nhất gồm những gì?' },
  { id: '3', icon: '⏱️', label: 'Quy định tạm trú', query: 'Thời hạn và quy định đăng ký tạm trú theo Luật Cư trú' },
  { id: '4', icon: '🪪', label: 'Luật Căn cước mới', query: 'Những điểm mới nổi bật của Luật Căn cước có hiệu lực từ 2024' },
  { id: '5', icon: '📊', label: 'Xuất báo cáo dân số', query: 'Làm thế nào để xuất báo cáo thống kê dân số ra file Excel?' },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: `Xin chào! Em là **Hạnh** - Trợ lý ảo AI của Hệ thống Quản lý Dân cư & Hộ khẩu **CIVIL-PRO** 🌸\n\nEm có thể hỗ trợ bạn tra cứu quy định cư trú, thủ tục cấp căn cước, hướng dẫn sử dụng phần mềm và giải đáp thắc mắc nghiệp vụ dân cư.`,
    timestamp: Date.now(),
  },
];

export const AiAgentWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Pulse animation for floating button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Open/close slide animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: Platform.OS !== 'web',
      tension: 65,
      friction: 10,
    }).start();

    if (isOpen) {
      setHasApiKey(!!getStoredApiKey());
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
    }
  }, [isOpen, slideAnim]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? inputText).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const reply = await sendMessageToAi(messages, query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Em xin lỗi, hiện tại hệ thống đang bận. Bạn vui lòng thử lại sau nhé!',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <>
      {/* ── Cửa sổ Trò chuyện ──────────────────────────────── */}
      {isOpen && (
        <Animated.View
          style={[
            styles.chatWindow,
            isMobile && styles.chatWindowMobile,
            {
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerProfile}>
              <View style={styles.avatarBorder}>
                <Image
                  source={require('../../../assets/images/ai_agent_avatar.jpg')}
                  style={styles.headerAvatar}
                  resizeMode="cover"
                />
                <View style={styles.onlineDot} />
              </View>
              <View>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.agentName}>Hạnh AI</Text>
                  <View style={styles.govBadge}>
                    <Text style={styles.govBadgeText}>CIVIL-PRO</Text>
                  </View>
                </View>
                <Text style={styles.statusSub}>
                  {hasApiKey ? '🟢 Trực tuyến • Gemini AI' : '🟢 Trực tuyến • Tri thức Dân cư'}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setShowKeyModal(true)}
                accessibilityLabel="Cài đặt API Key"
              >
                <Feather name="key" size={16} color={hasApiKey ? '#16a34a' : Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={handleClearChat}
                accessibilityLabel="Xóa hội thoại"
              >
                <Feather name="trash-2" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setIsOpen(false)}
                accessibilityLabel="Thu nhỏ"
              >
                <Feather name="minus" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body: Danh sách tin nhắn */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.sender === 'user' ? styles.userRow : styles.assistantRow,
                ]}
              >
                {msg.sender === 'assistant' && (
                  <Image
                    source={require('../../../assets/images/ai_agent_avatar.jpg')}
                    style={styles.messageAvatar}
                    resizeMode="cover"
                  />
                )}
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.userText : styles.assistantText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}

            {/* Hiệu ứng gõ 3 chấm */}
            {isTyping && (
              <View style={[styles.messageRow, styles.assistantRow]}>
                <Image
                  source={require('../../../assets/images/ai_agent_avatar.jpg')}
                  style={styles.messageAvatar}
                  resizeMode="cover"
                />
                <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, { opacity: 0.6 }]} />
                  <View style={[styles.typingDot, { opacity: 0.3 }]} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Prompts */}
          <View style={styles.quickPromptsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsContent}
            >
              {QUICK_PROMPTS.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.quickChip}
                  onPress={() => handleSend(p.query)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickChipIcon}>{p.icon}</Text>
                  <Text style={styles.quickChipText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={[
                styles.textInput,
                isWeb && ({ outline: 'none' } as any),
              ]}
              placeholder="Hỏi Hạnh AI về dân cư, thủ tục..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
            >
              <Feather name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── Nút nổi kích hoạt (Floating Action Button) ────── */}
      <View
        style={[
          styles.fabWrapper,
          isWeb && ({ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 } as any),
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsOpen(prev => !prev)}
            activeOpacity={0.85}
          >
            <View style={styles.fabInner}>
              <Image
                source={require('../../../assets/images/ai_agent_avatar.jpg')}
                style={styles.fabAvatar}
                resizeMode="cover"
              />
              <View style={styles.fabStatusDot} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {!isOpen && (
          <TouchableOpacity
            style={styles.fabBadge}
            onPress={() => setIsOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.fabBadgeSparkle}>✨</Text>
            <Text style={styles.fabBadgeText}> Trợ lý AI</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal Cài đặt API Key */}
      <AiApiKeyModal
        visible={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onKeySaved={() => setHasApiKey(!!getStoredApiKey())}
      />
    </>
  );
};

const styles = StyleSheet.create({
  // FAB
  fabWrapper: {
    position    : 'absolute',
    bottom      : 24,
    right       : 24,
    alignItems  : 'center',
    zIndex      : 9999,
  },
  fab: {
    width          : 62,
    height         : 62,
    borderRadius   : 31,
    backgroundColor: Colors.white,
    padding        : 3,
    shadowColor    : Colors.primary,
    shadowOffset   : { width: 0, height: 8 },
    shadowOpacity  : 0.35,
    shadowRadius   : 14,
    elevation      : 12,
    borderWidth    : 2.5,
    borderColor    : Colors.accent, // Viền vàng sao cờ nổi bật
  },
  fabInner: {
    width       : '100%',
    height      : '100%',
    borderRadius: 28,
    overflow    : 'hidden',
    position    : 'relative',
  },
  fabAvatar: {
    width : '100%',
    height: '100%',
  },
  fabStatusDot: {
    position       : 'absolute',
    bottom         : 2,
    right          : 2,
    width          : 12,
    height         : 12,
    borderRadius   : 6,
    backgroundColor: '#22c55e',
    borderWidth    : 2,
    borderColor    : '#fff',
  },
  fabBadge: {
    flexDirection    : 'row',
    alignItems       : 'center',
    gap              : 4,
    marginTop        : 6,
    backgroundColor  : Colors.primary,
    paddingHorizontal: 10,
    paddingVertical  : 4,
    borderRadius     : 12,
    shadowColor      : '#000',
    shadowOffset     : { width: 0, height: 3 },
    shadowOpacity    : 0.2,
    shadowRadius     : 4,
    elevation        : 4,
  },
  fabBadgeSparkle: {
    fontSize: 11,
  },
  fabBadgeText: {
    fontSize  : 11.5,
    fontFamily: 'BeVietnamPro-Bold',
    color     : '#fff',
  },

  // Cửa sổ Chat
  chatWindow: {
    position       : 'fixed' as any,
    bottom         : 98,
    right          : 24,
    width          : 380,
    height         : 540,
    backgroundColor: '#ffffff',
    borderRadius   : 24,
    shadowColor    : '#0f172a',
    shadowOffset   : { width: 0, height: 16 },
    shadowOpacity  : 0.25,
    shadowRadius   : 28,
    elevation      : 20,
    borderWidth    : 1,
    borderColor    : 'rgba(226, 232, 240, 0.9)',
    overflow       : 'hidden',
    zIndex         : 9998,
    display        : 'flex',
    flexDirection  : 'column',
  },
  chatWindowMobile: {
    right : 10,
    left  : 10,
    width : 'auto',
    bottom: 80,
    height: 500,
  },

  // Header
  header: {
    flexDirection    : 'row',
    alignItems       : 'center',
    justifyContent   : 'space-between',
    paddingHorizontal: 16,
    paddingVertical  : 14,
    backgroundColor  : '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems   : 'center',
    gap          : 10,
  },
  avatarBorder: {
    position       : 'relative',
    width          : 42,
    height         : 42,
    borderRadius   : 21,
    borderWidth    : 2,
    borderColor    : Colors.accent,
    padding        : 1,
  },
  headerAvatar: {
    width       : '100%',
    height      : '100%',
    borderRadius: 20,
  },
  onlineDot: {
    position       : 'absolute',
    bottom         : 0,
    right          : 0,
    width          : 10,
    height         : 10,
    borderRadius   : 5,
    backgroundColor: '#22c55e',
    borderWidth    : 1.5,
    borderColor    : '#fff',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems   : 'center',
    gap          : 6,
  },
  agentName: {
    fontSize  : 14.5,
    fontFamily: 'BeVietnamPro-Bold',
    color     : Colors.textPrimary,
  },
  govBadge: {
    backgroundColor  : Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical  : 1,
    borderRadius     : 6,
  },
  govBadgeText: {
    fontSize  : 9.5,
    fontFamily: 'BeVietnamPro-Bold',
    color     : Colors.primary,
    letterSpacing: 0.5,
  },
  statusSub: {
    fontSize  : 11,
    fontFamily: 'BeVietnamPro-Regular',
    color     : Colors.textSecondary,
    marginTop : 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems   : 'center',
    gap          : 4,
  },
  headerIconBtn: {
    padding: 7,
    borderRadius: 8,
  },

  // Danh sách tin nhắn
  messagesList: {
    flex           : 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
    gap    : 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems   : 'flex-end',
    gap          : 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width       : 28,
    height      : 28,
    borderRadius: 14,
    borderWidth : 1,
    borderColor : Colors.border,
  },
  messageBubble: {
    maxWidth        : '82%',
    paddingHorizontal: 14,
    paddingVertical  : 10,
    borderRadius    : 16,
  },
  userBubble: {
    backgroundColor      : Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor     : '#ffffff',
    borderWidth         : 1,
    borderColor         : '#e2e8f0',
    borderBottomLeftRadius: 4,
    shadowColor         : '#000',
    shadowOffset        : { width: 0, height: 1 },
    shadowOpacity       : 0.05,
    shadowRadius        : 2,
    elevation           : 1,
  },
  messageText: {
    fontSize  : 13.5,
    lineHeight: 20,
    fontFamily: 'BeVietnamPro-Regular',
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: Colors.textPrimary,
  },

  // Hiệu ứng đang gõ
  typingBubble: {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 4,
    paddingVertical: 12,
  },
  typingDot: {
    width          : 6,
    height         : 6,
    borderRadius   : 3,
    backgroundColor: Colors.primary,
  },

  // Gợi ý nhanh (Quick Prompts)
  quickPromptsSection: {
    backgroundColor  : '#ffffff',
    borderTopWidth   : 1,
    borderTopColor   : '#f1f5f9',
    paddingVertical  : 8,
    paddingHorizontal: 8,
  },
  quickPromptsContent: {
    gap            : 6,
    paddingHorizontal: 6,
  },
  quickChip: {
    flexDirection    : 'row',
    alignItems       : 'center',
    gap              : 4,
    backgroundColor  : '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical  : 6,
    borderRadius     : 14,
    borderWidth      : 1,
    borderColor      : '#e2e8f0',
  },
  quickChipIcon: {
    fontSize: 12,
  },
  quickChipText: {
    fontSize  : 11.5,
    fontFamily: 'BeVietnamPro-Medium',
    color     : Colors.textSecondary,
  },

  // Input Bar
  inputBar: {
    flexDirection    : 'row',
    alignItems       : 'center',
    paddingHorizontal: 12,
    paddingVertical  : 10,
    backgroundColor  : '#ffffff',
    borderTopWidth   : 1,
    borderTopColor   : '#f1f5f9',
    gap              : 8,
  },
  textInput: {
    flex             : 1,
    backgroundColor  : '#f8fafc',
    borderWidth      : 1,
    borderColor      : '#e2e8f0',
    borderRadius     : 20,
    paddingHorizontal: 14,
    paddingVertical  : 8,
    fontSize         : 13.5,
    fontFamily       : 'BeVietnamPro-Regular',
    color            : Colors.textPrimary,
    maxHeight        : 80,
  },
  sendBtn: {
    width          : 38,
    height         : 38,
    borderRadius   : 19,
    backgroundColor: Colors.primary,
    alignItems     : 'center',
    justifyContent : 'center',
    shadowColor    : Colors.primary,
    shadowOffset   : { width: 0, height: 3 },
    shadowOpacity  : 0.3,
    shadowRadius   : 5,
    elevation      : 3,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});
