import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

interface AnimatedFormModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const AnimatedFormModal: React.FC<AnimatedFormModalProps> = ({
  onClose,
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleClose = () => {
    // Exit animation (shrink and fade out)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdropClickable} />
      </TouchableWithoutFeedback>
      
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={() => { /* Stop touch propagation to backdrop */ }}>
          <View style={styles.modalContentWrapper}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
              <ScrollView
                style={styles.scrollStyle}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {React.cloneElement(children as React.ReactElement<any>, { onClose: handleClose })}
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Animated.View>
  );
};

export default AnimatedFormModal;

const styles = StyleSheet.create({
  backdrop: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Dimmed premium dark slate background overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: Platform.OS === 'web' ? 24 : 12,
  },
  backdropClickable: {
    ...(StyleSheet.absoluteFill as object),
  },
  modalContainer: {
    width: '100%',
    maxWidth: 1000, // Make the modal container wider as requested
    maxHeight: '92%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentWrapper: {
    width: '100%',
    maxHeight: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  keyboardAvoidingView: {
    width: '100%',
    maxHeight: '100%',
  },
  scrollStyle: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
