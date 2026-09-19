import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout, selectCurrentUser } from '../../store/auth/authSlice';
import { Colors } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import { AiAgentWidget } from '../../features/ai/components/AiAgentWidget';

export type ModuleId =
  | 'overview' | 'admin-units' | 'citizens' | 'households'
  | 'residency' | 'dynamics' | 'special-groups'
  | 'reports' | 'gis' | 'system' | 'payment' | 'sync';

interface NavItem {
  id: ModuleId;
  icon: string;
  label: string;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', icon: 'grid', label: 'Dashboard Tổng Quan', group: 'Tổng quan' },
  { id: 'admin-units', icon: 'map', label: 'Đơn vị hành chính', group: 'Nghiệp vụ cốt lõi' },
  { id: 'citizens', icon: 'users', label: 'Quản lý công dân', group: 'Nghiệp vụ cốt lõi' },
  { id: 'households', icon: 'home', label: 'Hộ gia đình / Hộ khẩu', group: 'Nghiệp vụ cốt lõi' },
  { id: 'residency', icon: 'map-pin', label: 'Quản lý cư trú', group: 'Nghiệp vụ cốt lõi' },
  { id: 'payment', icon: 'credit-card', label: 'Cổng nộp thuế (Kho bạc)', group: 'Nghiệp vụ cốt lõi' },
  { id: 'sync', icon: 'refresh-cw', label: 'Đồng bộ Quốc gia (VNeID)', group: 'Phân tích & Hệ thống' },
  { id: 'dynamics', icon: 'trending-up', label: 'Biến động dân cư', group: 'Biến động & Đặc thù' },
  { id: 'special-groups', icon: 'heart', label: 'Đối tượng đặc thù', group: 'Biến động & Đặc thù' },
  { id: 'reports', icon: 'bar-chart-2', label: 'Thống kê - Báo cáo', group: 'Phân tích & Hệ thống' },
  { id: 'gis', icon: 'globe', label: 'Bản đồ số (GIS)', group: 'Phân tích & Hệ thống' },
  { id: 'system', icon: 'settings', label: 'Cấu hình & Bảo mật', group: 'Phân tích & Hệ thống' },
];

const MODULE_TITLES: Record<ModuleId, string> = {
  'overview': 'Dashboard Tổng Quan',
  'admin-units': 'Quản lý Đơn vị hành chính',
  'citizens': 'Quản lý Công dân ',
  'households': 'Quản lý Hộ gia đình / Hộ khẩu',
  'residency': 'Quản lý Cư trú ',
  'payment': 'Cổng Nộp Thuế & Ngân Sách Nhà Nước',
  'sync': 'Trục Đồng Bộ CSDL Dân Cư Quốc Gia (VNeID)',
  'dynamics': 'Biến động dân cư ',
  'special-groups': 'Đối tượng đặc thù & Chính sách',
  'reports': 'Hệ thống Thống kê & Báo cáo',
  'gis': 'Bản đồ số Dân cư (GIS)',
  'system': 'Cấu hình & Nhật ký hệ thống',
};

const isWeb = Platform.OS === 'web';
const { width } = Dimensions.get('window');
const isDesktop = isWeb && width >= 1024; // Ensure sidebar is default visible on desktop screens

interface DashboardLayoutProps {
  activeModule: ModuleId;
  children: React.ReactNode;
  customTitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ activeModule, children, customTitle }) => {
  const dispatch   = useDispatch();
  const navigation = useNavigation<any>();
  const currentUser = useSelector(selectCurrentUser);

  // Tên hiển thị & chữ viết tắt avatar
  const displayName = currentUser?.fullName ?? currentUser?.username ?? 'Người dùng';
  const avatarText  = displayName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const sidebarAnim = useRef(new Animated.Value(isDesktop ? 1 : 0)).current;
  const [mounted, setMounted] = useState(isDesktop || sidebarOpen);

  useEffect(() => {
    if (isDesktop) {
      setMounted(true);
      sidebarAnim.setValue(1);
      return;
    }

    if (sidebarOpen) {
      setMounted(true);
      Animated.timing(sidebarAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setMounted(false);
      });
    }
  }, [sidebarOpen, isDesktop, sidebarAnim]);

  const handleNav = (id: ModuleId) => {
    switch (id) {
      case 'overview':
        navigation.navigate('Dashboard');
        break;
      case 'admin-units':
        navigation.navigate('AdminUnits');
        break;
      case 'citizens':
        navigation.navigate('Citizens');
        break;
      case 'households':
        navigation.navigate('Households');
        break;
      case 'residency':
        navigation.navigate('Residency');
        break;
      case 'dynamics':
        navigation.navigate('Dynamics');
        break;
      case 'special-groups':
        navigation.navigate('SpecialGroups');
        break;
      case 'payment':
        navigation.navigate('Payment');
        break;
      case 'sync':
        navigation.navigate('Sync');
        break;
      case 'reports':
        navigation.navigate('Reports');
        break;
      case 'gis':
        navigation.navigate('Gis');
        break;
      case 'system':
        navigation.navigate('System');
        break;
      default:
        navigation.navigate('Dashboard');
        break;
    }
    if (!isDesktop) setSidebarOpen(false);
  };

  const groups = [...new Set(NAV_ITEMS.map(i => i.group))];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.root}>
        {/* Backdrop nền mờ khi mở Sidebar trên Mobile */}
        {!isDesktop && mounted && (
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: sidebarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setSidebarOpen(false)}
            />
          </Animated.View>
        )}

        {/* ── Sidebar ──────────────────────────────────────── */}
        {(isDesktop || mounted) && (
          <Animated.View
            style={[
              styles.sidebar,
              !isDesktop && styles.sidebarMobile,
              !isDesktop && {
                transform: [
                  {
                    translateX: sidebarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-272, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Brand */}
            <View style={styles.sidebarBrand}>
              <Feather name="shield" size={24} color={Colors.white} style={styles.sidebarBrandIcon} />
              <View>
                <Text style={styles.sidebarBrandName}>CIVIL-PRO</Text>
                <Text style={styles.sidebarBrandSub}>Quản lý dân cư tỉnh</Text>
              </View>
            </View>

            {/* Nav */}
            <ScrollView style={styles.sidebarNav} showsVerticalScrollIndicator={false}>
              {groups.map(group => (
                <View key={group}>
                  <Text style={styles.navGroupLabel}>{group.toUpperCase()}</Text>
                  {NAV_ITEMS.filter(i => i.group === group).map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.navItem, activeModule === item.id && styles.navItemActive]}
                      onPress={() => handleNav(item.id)}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name={item.icon as any}
                        size={18}
                        color={activeModule === item.id ? Colors.primary : Colors.textSecondary}
                        style={styles.navItemIcon}
                      />
                      <Text style={[styles.navItemLabel, activeModule === item.id && styles.navItemLabelActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* User info */}
            <View style={styles.sidebarUser}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{avatarText}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.userRole} numberOfLines={1}>
                  {currentUser?.roles?.includes('ADMIN') ? 'Quản trị viên' : 'Cán bộ'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => dispatch(logout())} style={styles.logoutBtn}>
                <Feather name="log-out" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* ── Main Content ─────────────────────────────────── */}
        <View style={styles.main}>
          {/* Header */}
          <View style={[styles.header, { paddingHorizontal: isDesktop ? 32 : 16 }]}>
            {!isDesktop && (
              <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
                <Feather name="menu" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>
              {customTitle ?? MODULE_TITLES[activeModule]}
            </Text>
            <View style={styles.headerActions}>
              <View style={styles.notifBadge}>
                <Feather name="bell" size={22} color={Colors.textSecondary} />
                <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
              </View>
              <TouchableOpacity style={styles.quickAddBtn}>
                <Text style={styles.quickAddText}>{isDesktop ? '+ Nhập liệu nhanh' : '+'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Module Content */}
          <ScrollView style={[styles.content, { padding: isDesktop ? 24 : 12 }]} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText} numberOfLines={1}>
              {isDesktop ? 'Phiên bản: 4.2.0-PRO • Máy chủ: TRUNG-TAM-01' : 'CIVIL-PRO v4.2.0'}
            </Text>
            <Text style={styles.footerText}>© 2024</Text>
          </View>
        </View>

        {/* Trợ lý ảo Hạnh AI */}
        <AiAgentWidget />
      </View>
    </SafeAreaView>
  );
};

export default DashboardLayout;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.bgInput,
    position: 'relative',
    minHeight: isWeb ? ('100vh' as any) : '100%',
    height: '100%',
  },

  // Sidebar
  sidebar: {
    width: 272,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    flexDirection: 'column',
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    height: '100%',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
  },
  sidebarBrand: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primaryBgDeep,
  },
  sidebarBrandIcon: { fontSize: 28, color: Colors.white },
  sidebarBrandName: {
    fontSize: 22,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.white,
    letterSpacing: 1,
  },
  sidebarBrandSub: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Regular',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarNav: { flex: 1, paddingVertical: 12, paddingHorizontal: 16 },
  navGroupLabel: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro-Medium',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: Colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderRadius: 4,
  },
  navItemIcon: { fontSize: 20 },
  navItemLabel: {
    fontSize: 15,
    fontFamily: 'BeVietnamPro-Medium',
    color: Colors.textSecondary,
  },
  navItemLabelActive: {
    color: Colors.primary,
    fontFamily: 'BeVietnamPro-Bold',
  },
  sidebarUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { fontSize: 15, fontFamily: 'BeVietnamPro-Bold', color: Colors.primary },
  userName: { fontSize: 15, fontFamily: 'BeVietnamPro-SemiBold', color: Colors.textPrimary },
  userRole: { fontSize: 13, fontFamily: 'BeVietnamPro-Regular', color: Colors.textMuted },
  logoutBtn: { padding: 8, backgroundColor: Colors.bgInput, borderRadius: 8 },

  // Header
  header: {
    height: 72,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  menuBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notifBadge: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.dangerIcon,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: { fontSize: 10, fontFamily: 'BeVietnamPro-Bold', color: Colors.white },
  quickAddBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAddText: { color: Colors.white, fontSize: 15, fontFamily: 'BeVietnamPro-SemiBold' },

  // Main
  main: { flex: 1, flexDirection: 'column' },
  content: { flex: 1 },

  // Footer
  footer: {
    height: 40,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  footerText: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'BeVietnamPro-Regular' },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
    minHeight: isWeb ? ('100vh' as any) : '100%',
    height: '100%',
  },
});
