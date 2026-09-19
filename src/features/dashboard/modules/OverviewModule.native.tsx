// ============================================================
// OverviewModule – Dashboard Tổng Quan
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Svg, { Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import { selectAccessToken } from '../../../store/auth/authSlice';
import {
  getDashboardStatsApi,
  DEFAULT_DASHBOARD_STATS,
  DashboardStatsResponse,
} from '../services/statistical.service';

const DISTRICTS = [
  { name: 'Huyện Hòa Bình',       code: 'HB-001', pop: '245,600', households: '61,400', density: '840 người/km²', status: 'ỔN ĐỊNH',   statusColor: '#16a34a', statusBg: '#dcfce7' },
  { name: 'Thành phố Trung Tâm',  code: 'TP-002', pop: '850,000', households: '212,500', density: '2,100 người/km²', status: 'TĂNG NHANH', statusColor: Colors.primary, statusBg: Colors.primaryLight },
  { name: 'Huyện Miền Núi',       code: 'MN-003', pop: '120,000', households: '30,000', density: '150 người/km²', status: 'BIẾN ĐỘNG', statusColor: '#d97706', statusBg: '#fef3c7' },
];

const LOGS = [
  { color: Colors.primary,  text: 'Admin: Nguyễn Văn A đã duyệt yêu cầu tách hộ - Hộ HK-10029', time: '14:30 - 24/05/2024' },
  { color: '#d97706',       text: 'User: canbo_xa_hoa_binh đã thêm mới 05 tạm vắng',              time: '11:15 - 24/05/2024' },
  { color: Colors.dangerIcon, text: 'Hệ thống: Tự động sao lưu dữ liệu thất bại (Retry 1)',       time: '03:00 - 24/05/2024' },
];

const LineChart = () => {
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 10;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const birthData = [1200, 1900, 1500, 2100, 2400, 2200, 2800, 2400, 3000, 3200, 3100, 3500];
  const deathData = [400, 450, 410, 480, 460, 510, 530, 500, 580, 560, 590, 610];
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

  const getCoords = (data: number[]) => {
    return data.map((val, i) => {
      const x = paddingLeft + i * (chartWidth / (data.length - 1));
      const y = paddingTop + chartHeight - (val / 3500) * chartHeight;
      return { x, y };
    });
  };

  const birthCoords = getCoords(birthData);
  const deathCoords = getCoords(deathData);

  const getPathD = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, c, i) => {
      return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
    }, '');
  };

  const gridLines = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500];

  return (
    <View style={{ width: '100%', height: 180 }}>
      <Svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        {gridLines.map((val) => {
          const y = paddingTop + chartHeight - (val / 3500) * chartHeight;
          return (
            <G key={val}>
              <Line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="#f1f5f9" 
                strokeWidth={1} 
              />
              <SvgText 
                x={paddingLeft - 8} 
                y={y + 3} 
                fontSize={9} 
                fill="#94a3b8" 
                textAnchor="end"
                fontFamily="BeVietnamPro-Medium"
              >
                {val.toLocaleString()}
              </SvgText>
            </G>
          );
        })}

        {months.map((m, i) => {
          const x = paddingLeft + i * (chartWidth / (months.length - 1));
          return (
            <SvgText 
              key={m} 
              x={x} 
              y={height - 5} 
              fontSize={10} 
              fill="#94a3b8" 
              textAnchor="middle"
              fontFamily="BeVietnamPro-Medium"
            >
              {m}
            </SvgText>
          );
        })}

        <Path 
          d={getPathD(birthCoords)} 
          fill="none" 
          stroke={Colors.primary} 
          strokeWidth={2.5} 
        />
        {birthCoords.map((c, i) => (
          <Circle 
            key={`b-${i}`} 
            cx={c.x} 
            cy={c.y} 
            r={3.5} 
            fill="#ffffff" 
            stroke={Colors.primary} 
            strokeWidth={2.5} 
          />
        ))}

        <Path 
          d={getPathD(deathCoords)} 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth={2.5} 
        />
        {deathCoords.map((c, i) => (
          <Circle 
            key={`d-${i}`} 
            cx={c.x} 
            cy={c.y} 
            r={3.5} 
            fill="#ffffff" 
            stroke="#ef4444" 
            strokeWidth={2.5} 
          />
        ))}
      </Svg>
    </View>
  );
};

const DonutChart = () => {
  const size = 160;
  const radius = 50;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { label: '15-64 tuổi', pct: 0.65, color: '#3b82f6' },
    { label: '0-14 tuổi', pct: 0.25, color: '#93c5fd' },
    { label: 'Trên 65 tuổi', pct: 0.10, color: '#1e3a8a' }
  ];

  let accumulatedPct = 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 160 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => {
            const strokeDashoffset = circumference - (seg.pct * circumference);
            const rotation = (accumulatedPct * 360) - 90;
            accumulatedPct += seg.pct;

            return (
              <Circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation} ${center} ${center})`}
              />
            );
          })}
        </Svg>
      </View>

      <View style={{ flex: 1, paddingLeft: 20, gap: 12 }}>
        {segments.map((seg, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: seg.color }} />
            <Text style={{ fontSize: 13, fontFamily: 'BeVietnamPro-Medium', color: Colors.textSecondary }}>
              {seg.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const OverviewModule: React.FC = () => {
  const accessToken = useSelector(selectAccessToken);
  const [stats, setStats] = useState<DashboardStatsResponse>(DEFAULT_DASHBOARD_STATS);

  useEffect(() => {
    let isMounted = true;
    getDashboardStatsApi(accessToken || undefined)
      .then((data) => {
        if (isMounted && data) {
          setStats(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const metrics = [
    {
      icon: 'users',
      label: 'Tổng dân số',
      value: stats.totalPopulation.toLocaleString('vi-VN'),
      trend: stats.growthRatePct != null ? `+${stats.growthRatePct}%` : '+1.2%',
      trendUp: true,
      color: Colors.primary,
    },
    {
      icon: 'home',
      label: 'Số hộ gia đình',
      value: stats.totalHouseholds.toLocaleString('vi-VN'),
      trend: 'Toàn tỉnh',
      trendUp: null,
      color: '#7c3aed',
    },
    {
      icon: 'suitcase',
      label: 'Tạm trú/Tạm vắng',
      value: (stats.temporaryResidents ?? 12450).toLocaleString('vi-VN'),
      trend: 'Tháng này',
      trendUp: null,
      color: '#d97706',
    },
    {
      icon: 'id-card',
      label: 'Đến hạn cấp CCCD',
      value: (stats.expiringNationalIds ?? 2841).toLocaleString('vi-VN'),
      trend: 'Khẩn cấp',
      trendUp: false,
      color: Colors.dangerIcon,
    },
  ];

  return (
    <View style={styles.container}>

      {/* Metric Cards */}
      <View style={styles.metricsRow}>
        {metrics.map((m, i) => (
          <View key={i} style={styles.metricCard}>
            <View style={styles.metricTop}>
              <View style={[styles.metricIconBox, { backgroundColor: m.color + '18' }]}>
                <FontAwesome5 name={m.icon} size={18} color={m.color} />
              </View>
              <Text style={[styles.metricTrend, { color: m.trendUp === true ? '#16a34a' : m.trendUp === false ? Colors.dangerIcon : Colors.textMuted }]}>
                {m.trendUp === true ? '↑ ' : m.trendUp === false ? '⚠ ' : ''}{m.trend}
              </Text>
            </View>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={styles.metricValue}>{m.value}</Text>
          </View>
        ))}
      </View>

    {/* Charts Section */}
    <View style={styles.chartsRow}>
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Biến động dân cư theo tháng</Text>
        <LineChart />
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Số sinh</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Số tử</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Cơ cấu độ tuổi</Text>
        <DonutChart />
      </View>
    </View>

    {/* District Table */}
    <View style={styles.tableCard}>
      <View style={styles.tableHeader}>
        <Text style={styles.cardTitle}>Dân số theo đơn vị hành chính (Cấp Huyện)</Text>
        <Text style={styles.viewAll}>Xem tất cả</Text>
      </View>
      <View style={styles.tableHead}>
        {['Tên Huyện/Quận', 'Mã ĐVHC', 'Dân số', 'Số Hộ', 'Mật độ', 'Trạng thái'].map((h, i) => (
          <Text key={i} style={[styles.th, i === 0 && { flex: 2 }]}>{h}</Text>
        ))}
      </View>
      {DISTRICTS.map((d, i) => (
        <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
          <Text style={[styles.td, styles.tdBold, { flex: 2 }]}>{d.name}</Text>
          <Text style={[styles.td, styles.tdMuted]}>{d.code}</Text>
          <Text style={styles.td}>{d.pop}</Text>
          <Text style={styles.td}>{d.households}</Text>
          <Text style={styles.td}>{d.density}</Text>
          <View style={styles.td}>
            <View style={[styles.statusBadge, { backgroundColor: d.statusBg }]}>
              <Text style={[styles.statusText, { color: d.statusColor }]}>{d.status}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>

      {/* Recent Logs */}
      <View style={styles.tableCard}>
        <Text style={styles.cardTitle}>Nhật ký hoạt động gần đây</Text>
        {LOGS.map((log, i) => (
          <View key={i} style={[styles.logItem, i > 0 && styles.logBorder]}>
            <View style={[styles.logDot, { backgroundColor: log.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.logText}>{log.text}</Text>
              <Text style={styles.logTime}>{log.time}</Text>
            </View>
          </View>
        ))}
      </View>

    </View>
  );
};

export default OverviewModule;

const styles = StyleSheet.create({
  container  : { gap: 20, paddingBottom: 40 },
  metricsRow : { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metricCard : {
    flex: 1, minWidth: 160,
    backgroundColor: Colors.white,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)',
    gap: 6,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  metricTop      : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metricIconBox  : { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metricIcon     : { fontSize: 22 },
  metricTrend    : { fontSize: 13, fontFamily: 'BeVietnamPro-SemiBold' },
  metricLabel    : { fontSize: 15, color: Colors.textSecondary, fontFamily: 'BeVietnamPro-Medium' },
  metricValue    : { fontSize: 32, fontFamily: 'BeVietnamPro-ExtraBold', color: Colors.textPrimary },

  chartsRow  : { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  chartCard  : {
    flex: 1, minWidth: 280,
    backgroundColor: Colors.white,
    borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle      : { fontSize: 20, fontFamily: 'BeVietnamPro-Bold', color: Colors.primaryDark, marginBottom: 16 },
  chartLegend    : { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem     : { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot      : { width: 10, height: 10, borderRadius: 5 },
  legendText     : { fontSize: 13, color: Colors.textSecondary, fontFamily: 'BeVietnamPro-Medium' },

  tableCard  : {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)',
    overflow: 'hidden',
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: Colors.border },
  viewAll    : { fontSize: 15, color: Colors.accent, fontFamily: 'BeVietnamPro-SemiBold' },
  tableHead  : { flexDirection: 'row', backgroundColor: Colors.bgInput, paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 8, marginTop: 8, borderRadius: 8 },
  th         : { flex: 1, fontSize: 13, fontFamily: 'BeVietnamPro-Bold', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow   : { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#fafafa' },
  td         : { flex: 1, fontSize: 15, color: Colors.textPrimary, fontFamily: 'BeVietnamPro-Regular' },
  tdBold     : { fontFamily: 'BeVietnamPro-SemiBold', color: Colors.textPrimary },
  tdMuted    : { color: Colors.textMuted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  statusText : { fontSize: 12, fontFamily: 'BeVietnamPro-Bold' },

  logItem  : { flexDirection: 'row', gap: 16, padding: 20, alignItems: 'flex-start' },
  logBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  logDot   : { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  logText  : { fontSize: 15, color: Colors.textPrimary, fontFamily: 'BeVietnamPro-SemiBold' },
  logTime  : { fontSize: 13, color: Colors.textMuted, marginTop: 4, fontFamily: 'BeVietnamPro-Regular' },
});
