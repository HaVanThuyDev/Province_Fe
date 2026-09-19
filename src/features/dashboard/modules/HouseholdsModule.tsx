import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Colors } from '../../../theme/colors';
import { selectAccessToken } from '../../../store/auth/authSlice';
import {
  HouseholdItem,
  DEFAULT_HOUSEHOLD_DATA,
  getHouseholdsApi,
} from '../services/household.service';

const isWeb = Platform.OS === 'web';
const { width: screenWidth } = Dimensions.get('window');
const isDesktop = isWeb && screenWidth >= 1024;

const HouseholdsModule: React.FC = () => {
  const navigation = useNavigation<any>();
  const accessToken = useSelector(selectAccessToken);
  const [households, setHouseholds] = useState<HouseholdItem[]>(DEFAULT_HOUSEHOLD_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getHouseholdsApi(0, 50, accessToken || undefined);
      if (res && res.items && res.items.length > 0) {
        setHouseholds(res.items);
      }
    } catch {
      // Giữ mock data nếu offline
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const memoizedRows = useMemo(() => {
    return households.map((h, i) => {
      const statusColor = h.status === 'Hoàn chỉnh' ? '#16a34a' : h.status === 'Cần cập nhật' ? '#d97706' : Colors.primary;
      const statusBg    = h.status === 'Hoàn chỉnh' ? '#dcfce7' : h.status === 'Cần cập nhật' ? '#fef3c7' : Colors.primaryLight;
      return (
        <View key={h.code || i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
          <Text style={[styles.td, styles.codeText]}>{h.code}</Text>
          <Text style={[styles.td, styles.boldText]}>{h.head}</Text>
          <Text style={styles.td}>{h.members} người</Text>
          <Text style={[styles.td, { flex: 2, fontSize: 14, fontFamily: 'BeVietnamPro-Regular', color: Colors.textSecondary }]} numberOfLines={2}>{h.address}</Text>
          <Text style={styles.td}>{h.type}</Text>
          <View style={styles.td}>
            <View style={[styles.badge, { backgroundColor: statusBg }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{h.status}</Text>
            </View>
          </View>
          <View style={[styles.td, { flexDirection: 'row', gap: 8 }]}>
            <TouchableOpacity><Text>👁️</Text></TouchableOpacity>
            <TouchableOpacity><Text>✏️</Text></TouchableOpacity>
          </View>
        </View>
      );
    });
  }, [households]);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Danh sách hộ gia đình</Text>
        <View style={styles.toolbarRight}>
          {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />}
          <TouchableOpacity style={styles.filterBtn} onPress={loadData}><Text style={styles.filterText}>🔄 Làm mới</Text></TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddHousehold')}><Text style={styles.addBtnText}>+ Thêm hộ mới</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
        <View style={[styles.tableCard, !isDesktop && { minWidth: 900 }]}>
          <View style={styles.tableHead}>
            {['Mã hộ khẩu', 'Chủ hộ', 'Số nhân khẩu', 'Địa chỉ', 'Loại cư trú', 'Trạng thái', 'Thao tác'].map((h, i) => (
              <Text key={i} style={[styles.th, i === 3 && { flex: 2 }]}>{h}</Text>
            ))}
          </View>
          {memoizedRows}
        </View>
      </ScrollView>
    </View>
  );
};

export default HouseholdsModule;

const styles = StyleSheet.create({
  container  : { gap: 16, paddingBottom: 40 },
  toolbar    : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  title      : { fontSize: 18, fontFamily: 'BeVietnamPro-Bold', color: Colors.primaryDark },
  toolbarRight: { flexDirection: 'row', gap: 10 },
  filterBtn  : { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.white },
  filterText : { fontSize: 15, color: Colors.textSecondary, fontFamily: 'BeVietnamPro-Medium' },
  addBtn     : { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 10 },
  addBtnText : { fontSize: 15, color: Colors.white, fontFamily: 'BeVietnamPro-SemiBold' },
  scrollWrapper: { width: '100%', borderRadius: 16 },
  tableCard  : { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  tableHead  : { flexDirection: 'row', backgroundColor: Colors.bgInput, paddingHorizontal: 16, paddingVertical: 14 },
  th         : { flex: 1, fontSize: 13, fontFamily: 'BeVietnamPro-Bold', color: Colors.textMuted, textTransform: 'uppercase' },
  tableRow   : { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border },
  tableRowAlt: { backgroundColor: '#fafafa' },
  td         : { flex: 1, fontSize: 15, color: Colors.textPrimary, fontFamily: 'BeVietnamPro-Regular' },
  codeText   : { fontFamily: 'BeVietnamPro-Bold', color: Colors.textPrimary },
  boldText   : { fontFamily: 'BeVietnamPro-SemiBold' },
  badge      : { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText  : { fontSize: 13, fontFamily: 'BeVietnamPro-Bold' },
});
