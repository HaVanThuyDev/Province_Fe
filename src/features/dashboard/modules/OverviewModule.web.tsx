// ============================================================
// OverviewModule.web – Dashboard Tổng Quan (Phiên bản Web dùng Highcharts)
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../../theme/colors';
import { selectAccessToken } from '../../../store/auth/authSlice';
import {
  getDashboardStatsApi,
  DEFAULT_DASHBOARD_STATS,
  DashboardStatsResponse,
} from '../services/statistical.service';

const HighchartsComponent: any = (HighchartsReact as any)?.default || HighchartsReact;

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

const LineChartWeb = () => {
  const options: Highcharts.Options = {
    chart: {
      type: 'line',
      height: 220,
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'BeVietnamPro-Medium'
      }
    },
    title: {
      text: ''
    },
    credits: {
      enabled: false
    },
    xAxis: {
      categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      gridLineWidth: 0,
      labels: {
        style: {
          color: '#94a3b8',
          fontSize: '11px',
          fontFamily: 'BeVietnamPro-Regular'
        }
      },
      lineColor: '#cbd5e1'
    },
    yAxis: {
      title: {
        text: ''
      },
      gridLineColor: '#f1f5f9',
      labels: {
        style: {
          color: '#94a3b8',
          fontSize: '10px',
          fontFamily: 'BeVietnamPro-Regular'
        }
      },
      min: 0,
      max: 3500,
      tickInterval: 500
    },
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      shadow: true,
      headerFormat: '<span style="font-size: 11px; color: #64748b; font-family: BeVietnamPro-Regular; margin-bottom: 4px; display: block;">Tháng {point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0;font-family: BeVietnamPro-SemiBold;">{series.name}: </td>' +
        '<td style="padding-left:10px;text-align:right;font-family: BeVietnamPro-Bold; color: #1e293b;"><b>{point.y} người</b></td></tr>',
      footerFormat: '</table>'
    },
    plotOptions: {
      line: {
        marker: {
          radius: 5,
          symbol: 'circle',
          fillColor: '#ffffff',
          lineWidth: 2.5,
          lineColor: undefined // inherit from series color
        },
        lineWidth: 3
      }
    },
    series: [
      {
        name: 'Số sinh',
        type: 'line',
        data: [1200, 1900, 1500, 2100, 2400, 2200, 2800, 2400, 3000, 3200, 3100, 3500],
        color: '#3b82f6'
      },
      {
        name: 'Số tử',
        type: 'line',
        data: [400, 450, 410, 480, 460, 510, 530, 500, 580, 560, 590, 610],
        color: '#ef4444'
      }
    ]
  };

  return <HighchartsComponent highcharts={Highcharts} options={options} />;
};

const DonutChartWeb = () => {
  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      height: 220,
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'BeVietnamPro-Medium'
      }
    },
    title: {
      text: ''
    },
    credits: {
      enabled: false
    },
    tooltip: {
      useHTML: true,
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      pointFormat: '<span style="color:{point.color}; font-family: BeVietnamPro-SemiBold;">{point.name}:</span> <b style="font-family: BeVietnamPro-Bold; color: #1e293b;">{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        innerSize: '65%',
        borderWidth: 2,
        borderColor: '#ffffff',
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      itemMarginBottom: 10,
      itemStyle: {
        color: '#64748b',
        fontFamily: 'BeVietnamPro-Medium',
        fontSize: '13px',
        fontWeight: '500'
      }
    },
    series: [
      {
        name: 'Tỷ lệ',
        type: 'pie',
        data: [
          { name: '15-64 tuổi', y: 65, color: '#3b82f6' },
          { name: '0-14 tuổi', y: 25, color: '#93c5fd' },
          { name: 'Trên 65 tuổi', y: 10, color: '#1e3a8a' }
        ]
      }
    ]
  };

  return <HighchartsComponent highcharts={Highcharts} options={options} />;
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
      <View style={[styles.chartCard, { flex: 1.6 }]}>
        <Text style={styles.cardTitle}>Biến động dân cư theo tháng</Text>
        <LineChartWeb />
      </View>

      <View style={[styles.chartCard, { flex: 1 }]}>
        <Text style={styles.cardTitle}>Cơ cấu độ tuổi</Text>
        <DonutChartWeb />
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
    minWidth: 280,
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
