import React, { useEffect } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthSessionManager } from './src/hooks/useAuthSessionManager';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, minHeight: '100vh' as any, padding: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff5f5' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#b91c1c', marginBottom: 12 }}>
            Đã xảy ra lỗi hiển thị giao diện:
          </Text>
          <Text style={{ fontSize: 13.5, color: '#374151', textAlign: 'center', marginBottom: 24, maxWidth: 600, lineHeight: 22 }}>
            {this.state.error?.message}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('cudan_auth_session');
                window.location.href = '/';
              }
            }}
            style={{ backgroundColor: '#dc2626', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Xóa phiên đăng nhập & Tải lại trang</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  // Lắng nghe hoạt động người dùng và xử lý tự động đăng xuất sau 30 phút không hoạt động
  useAuthSessionManager();

  // Tiêm CSS toàn cục cho nền Web một cách an toàn bên trong useEffect khi DOM đã sẵn sàng
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'CIVIL-PRO • Quản lý Cư dân';
      const styleId = 'cudan-anti-autofill-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          /* Xóa bỏ ô màu xanh nhạt (#e8f0fe) mặc định của trình duyệt khi autofill */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active,
          input:-internal-autofill-selected,
          input:-internal-autofill-previewed {
            -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
            box-shadow: 0 0 0 1000px transparent inset !important;
            -webkit-text-fill-color: #1e293b !important;
            caret-color: #1e293b !important;
            transition: background-color 50000s ease-in-out 0s, color 50000s ease-in-out 0s !important;
            background-color: transparent !important;
          }

          /* Đảm bảo ô input luôn trong suốt để hiển thị giao diện form sạch sẽ */
          input {
            background-color: transparent !important;
            outline: none !important;
          }
        `;
        if (document.head) {
          document.head.appendChild(style);
        }
      }
    }
  }, []);

  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaProvider style={{ flex: 1, minHeight: isWeb ? ('100vh' as any) : '100%', height: '100%' as any }}>
      <View style={{ flex: 1, minHeight: isWeb ? ('100vh' as any) : '100%', height: '100%' as any }}>
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
};

const App: React.FC = () => {
  const [fontsLoaded, fontError] = useFonts({
    'BeVietnamPro-Light'    : require('./src/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Light.ttf'),
    'BeVietnamPro-Regular'  : require('./src/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf'),
    'BeVietnamPro-Medium'   : require('./src/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Medium.ttf'),
    'BeVietnamPro-SemiBold' : require('./src/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf'),
    'BeVietnamPro-Bold'     : require('./src/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf'),
    'BeVietnamPro-ExtraBold': require('./src/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-ExtraBold.ttf'),
  });

  // Trên Web không chặn render bằng null nếu font đang tải hoặc lỗi, để tránh hiện tượng màn hình trắng
  if (!fontsLoaded && !fontError && Platform.OS !== 'web') {
    return null;
  }

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;