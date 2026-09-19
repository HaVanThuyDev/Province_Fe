// ============================================================
// CitizensModule – Quản lý Công dân
// Hiệu ứng mượt mà (Fluid Animated Cross-Fade & Indeterminate Loading Bar)
// Chuẩn hóa tìm kiếm có dấu / không dấu đa trường & Lọc Thường trú / Tạm trú
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Colors } from '../../../theme/colors';
import { selectAccessToken } from '../../../store/auth/authSlice';
import {
  CitizenItem,
  CitizenSummaryResponse,
  CitizenPageResponse,
  DEFAULT_CITIZEN_DATA,
  searchCitizensApi,
} from '../services/citizen.service';

const isWeb = Platform.OS === 'web';
const { width: screenWidth } = Dimensions.get('window');
const isDesktop = isWeb && screenWidth >= 1024;

// ── SVG ICONS HIỆN ĐẠI CHO THAO TÁC BẢNG ─────────────────────────
// Biểu tượng Xem chi tiết (Modern View Details Eye Icon)
const ViewDetailsIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#2563eb' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="12"
      r="3.2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="13.2" cy="10.8" r="0.9" fill={color} />
  </Svg>
);

// Biểu tượng Chỉnh sửa thông tin (Modern Edit Pen Icon)
const EditCitizenIcon: React.FC<{ size?: number; color?: string }> = ({ size = 17, color = '#d97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20h9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 5l3 3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CITIZEN_TYPES = ['Tất cả', 'Thường trú', 'Tạm trú'] as const;
type CitizenTypeFilter = typeof CITIZEN_TYPES[number];

// Chuẩn hóa bỏ dấu tiếng Việt để tìm kiếm tiếng Việt không dấu (nguyen -> Nguyễn)
const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

const CitizensModule: React.FC = () => {
  const navigation = useNavigation<any>();
  const accessToken = useSelector(selectAccessToken);

  const [citizenData, setCitizenData] = useState<CitizenPageResponse>(DEFAULT_CITIZEN_DATA);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<CitizenTypeFilter>('Tất cả');

  // Animation values cho chuyển cảnh mượt mà
  const tableFadeAnim = useRef(new Animated.Value(1)).current;
  const loadingOpacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const debounceTimeout = useRef<any>(null);
  const requestIdRef = useRef<number>(0);
  const isFirstMount = useRef<boolean>(true);

  // Hiệu ứng thanh tiến trình mượt mà chạy trên GPU (useNativeDriver: true với transform translateX)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [progressAnim]);

  // Kiểm tra điều kiện tìm kiếm đa trường không phân biệt dấu
  const matchesQuery = (c: CitizenItem, rawQuery: string): boolean => {
    if (!rawQuery) return true;
    const qLower = rawQuery.toLowerCase().trim();
    const qClean = removeVietnameseTones(rawQuery);

    const nameLower = c.fullName.toLowerCase();
    const nameClean = removeVietnameseTones(c.fullName);

    const addressLower = (c.permanentAddress || '').toLowerCase();
    const addressClean = removeVietnameseTones(c.permanentAddress || '');

    const jobLower = (c.occupation || '').toLowerCase();
    const jobClean = removeVietnameseTones(c.occupation || '');

    const codeLower = (c.citizenCode || '').toLowerCase();
    const cccdClean = (c.idCardNumber || '').replace(/\s+/g, '');
    const qNumeric = rawQuery.replace(/\s+/g, '');

    return (
      nameLower.includes(qLower) ||
      nameClean.includes(qClean) ||
      codeLower.includes(qLower) ||
      cccdClean.includes(qNumeric) ||
      addressLower.includes(qLower) ||
      addressClean.includes(qClean) ||
      jobLower.includes(qLower) ||
      jobClean.includes(qClean)
    );
  };

  // Đếm số lượng thực tế
  const typeCounts = {
    all: DEFAULT_CITIZEN_DATA.totalElements,
    thuongTru: DEFAULT_CITIZEN_DATA.items.filter((c) => c.citizenType === 'Thường trú').length,
    tamTru: DEFAULT_CITIZEN_DATA.items.filter((c) => c.citizenType === 'Tạm trú').length,
  };

  // Hàm thực thi tìm kiếm & lọc với hoạt họa mượt mà (GPU accelerated cross-fade, zero hitching)
  const executeSearch = useCallback(
    async (pageIndex: number, keyword: string, typeFilter: CitizenTypeFilter) => {
      const currentRequestId = ++requestIdRef.current;
      setIsLoading(true);

      // Bắt đầu làm mờ nhẹ bảng (0.55 giữ nội dung ổn định không bị giật) và hiện thanh tiến trình
      Animated.parallel([
        Animated.timing(tableFadeAnim, {
          toValue: 0.55,
          duration: 140,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loadingOpacityAnim, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      const q = keyword.trim();
      const citizenTypeParam = typeFilter !== 'Tất cả' ? typeFilter : undefined;
      const minTimer = new Promise((resolve) => setTimeout(resolve, 180));

      let apiSuccess = false;
      let newResult: CitizenPageResponse | null = null;

      try {
        const res = await searchCitizensApi(
          {
            keyword: q || undefined,
            fullName: q || undefined,
            citizenType: citizenTypeParam,
          },
          {
            page: pageIndex,
            size: pageSize,
            sort: 'fullName',
          },
          accessToken || undefined,
        );

        if (res && Array.isArray(res.items) && res.items.length > 0) {
          await minTimer;
          if (currentRequestId === requestIdRef.current) {
            newResult = res;
            apiSuccess = true;
          }
        }
      } catch {
        // Fallback sang lọc cục bộ không dấu
      }

      if (currentRequestId !== requestIdRef.current) {
        return; // Đã có request mới hơn, bỏ qua request cũ tránh giật dữ liệu
      }

      if (!apiSuccess) {
        let filtered = DEFAULT_CITIZEN_DATA.items;

        if (q) {
          filtered = filtered.filter((c) => matchesQuery(c, q));
        }

        if (citizenTypeParam) {
          filtered = filtered.filter((c) => c.citizenType === citizenTypeParam);
        }

        const totalElements = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
        const validPage = Math.min(pageIndex, Math.max(0, totalPages - 1));
        const pagedItems = filtered.slice(validPage * pageSize, (validPage + 1) * pageSize);

        await minTimer;
        if (currentRequestId !== requestIdRef.current) return;

        newResult = {
          items: pagedItems,
          totalElements,
          totalPages,
          page: validPage,
          size: pageSize,
        };
      }

      if (newResult && currentRequestId === requestIdRef.current) {
        // Cập nhật state dữ liệu mới
        setCitizenData(newResult);
        setCurrentPage(newResult.page ?? pageIndex);

        // Chờ React và DOM commit layout xong mới kích hoạt hiệu ứng fade-in mượt mà trên GPU
        requestAnimationFrame(() => {
          if (currentRequestId !== requestIdRef.current) return;

          Animated.parallel([
            Animated.timing(tableFadeAnim, {
              toValue: 1,
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(loadingOpacityAnim, {
              toValue: 0,
              duration: 200,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (currentRequestId === requestIdRef.current) {
              setIsLoading(false);
            }
          });
        });
      }
    },
    [accessToken, pageSize, tableFadeAnim, loadingOpacityAnim],
  );

  // Kích hoạt tìm kiếm debounce CHỈ khi người dùng gõ phím vào ô tìm kiếm
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      executeSearch(0, search, selectedType);
    }, 250);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [search]);

  // Chuyển tab lọc tức thì không bị lặp hay gián đoạn
  const handleTypeSelect = (type: CitizenTypeFilter) => {
    if (selectedType === type && !isLoading) return;
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    setSelectedType(type);
    executeSearch(0, search, type);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= (citizenData.totalPages || 1) || isLoading) return;
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    executeSearch(newPage, search, selectedType);
  };

  const handleRefresh = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    executeSearch(currentPage, search, selectedType);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'CD').toUpperCase();
  };

  const formatGender = (genderLabel: string) => {
    if (genderLabel === 'Male') return 'Nam';
    if (genderLabel === 'Female') return 'Nữ';
    if (genderLabel === 'Other') return 'Khác';
    return genderLabel;
  };

  const getTagStyle = (type: string) => {
    if (type === 'Thường trú') {
      return { bg: '#eff6ff', color: Colors.primary };
    }
    if (type === 'Tạm trú') {
      return { bg: '#fef3c7', color: '#d97706' };
    }
    return { bg: '#dcfce7', color: '#16a34a' };
  };

  const totalPages = citizenData.totalPages || Math.max(1, Math.ceil(citizenData.totalElements / pageSize));

  // Hàm tính toán danh sách số trang linh hoạt (Sliding Window & Ellipsis)
  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const pages: (number | string)[] = [];

    if (current <= 3) {
      for (let i = 0; i < 5; i++) {
        pages.push(i);
      }
      pages.push('dots-end');
      pages.push(total - 1);
    } else if (current >= total - 4) {
      pages.push(0);
      pages.push('dots-start');
      for (let i = total - 5; i < total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      pages.push('dots-start');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('dots-end');
      pages.push(total - 1);
    }

    return pages;
  };

  return (
    <View style={styles.container}>
      {/* ── TOOLBAR TÌM KIẾM & BỘ LỌC ─────────────────────────── */}
      <View style={styles.toolbar}>
        {/* Ô tìm kiếm */}
        <View style={[styles.searchBox, isLoading && styles.searchBoxActive]}>
          {isLoading ? (
            <View style={styles.searchSpinnerWrapper}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <Text style={styles.searchIcon}>🔍</Text>
          )}
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo họ tên (có/không dấu), CCCD, mã CD, địa chỉ..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => {
              if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
              executeSearch(0, search, selectedType);
            }}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
                executeSearch(0, '', selectedType);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Nút lọc nhanh: Tất cả / Thường trú / Tạm trú */}
        <View style={styles.filterTabs}>
          {CITIZEN_TYPES.map((type) => {
            const isActive = selectedType === type;
            const count =
              type === 'Tất cả'
                ? typeCounts.all
                : type === 'Thường trú'
                ? typeCounts.thuongTru
                : typeCounts.tamTru;

            return (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => handleTypeSelect(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {type}
                </Text>
                <View style={[styles.chipBadge, isActive && styles.chipBadgeActive]}>
                  <Text style={[styles.chipBadgeText, isActive && styles.chipBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nút thao tác làm mới & thêm */}
        <View style={styles.toolbarRight}>
          <TouchableOpacity
            style={[styles.refreshBtn, isLoading && styles.btnDisabled]}
            onPress={handleRefresh}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshIcon}>🔄</Text>
            <Text style={styles.refreshBtnText}>Làm mới</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddCitizen')}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Thêm công dân</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── TABLE VỚI HIỆU ỨNG CHUYỂN CẢNH MƯỢT MÀ ───────────── */}
      <View style={styles.tableCardContainer}>
        {/* Thanh loading tiến trình mượt mà ở đỉnh bảng - luôn giữ trong layout, ẩn hiện bằng GPU opacity */}
        <Animated.View
          style={[styles.progressBarTrack, { opacity: loadingOpacityAnim }]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                transform: [
                  {
                    translateX: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-screenWidth * 0.4, screenWidth * 1.1],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>

        <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
          <View style={[styles.tableInner, !isDesktop && { minWidth: 960 }]}>
            {/* Header */}
            <View style={styles.tableHead}>
              {['Công dân', 'Thông tin định danh', 'Địa chỉ thường trú', 'Nghề nghiệp', 'Loại cư trú', 'Thao tác'].map(
                (h, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.th,
                      i === 0 && { flex: 2.0 },
                      i === 1 && { flex: 1.8 },
                      i === 2 && { flex: 2.4 },
                      i === 3 && { flex: 1.4 },
                      i === 4 && { flex: 1.2 },
                      i === 5 && { flex: 0.9, textAlign: 'center' },
                    ]}
                  >
                    {h}
                  </Text>
                ),
              )}
            </View>

            {/* Table Rows bọc trong Animated.View mượt mà với GPU composite layer */}
            <Animated.View
              style={[
                styles.tableBody,
                { opacity: tableFadeAnim },
                Platform.OS === 'web' && ({
                  transition: 'opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'opacity',
                } as any),
              ]}
            >
              {citizenData.items.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
                  <Text style={styles.emptyText}>
                    Không có công dân nào khớp với từ khóa "{search}" trong danh mục "{selectedType}".
                  </Text>
                  <TouchableOpacity
                    style={styles.resetFilterBtn}
                    onPress={() => {
                      setSearch('');
                      setSelectedType('Tất cả');
                    }}
                  >
                    <Text style={styles.resetFilterText}>Xóa bộ lọc & Xem tất cả</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                citizenData.items.map((c: CitizenSummaryResponse, i: number) => {
                  const tagStyle = getTagStyle(c.citizenType);
                  return (
                    <View
                      key={`citizen-${c.id || c.citizenCode || i}`}
                      style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
                    >
                      {/* Tên & Avatar */}
                      <View style={[styles.td, { flex: 2.0, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{getInitials(c.fullName)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.citizenName} numberOfLines={1}>
                            {c.fullName}
                          </Text>
                          <Text style={styles.citizenSub}>
                            {formatGender(c.genderLabel)} • {c.age} tuổi ({c.dateOfBirth})
                          </Text>
                        </View>
                      </View>

                      {/* CCCD & Mã */}
                      <View style={[styles.td, { flex: 1.8 }]}>
                        <Text style={styles.cccdText}>{c.idCardNumber}</Text>
                        <Text style={styles.codeText}>Mã: {c.citizenCode}</Text>
                      </View>

                      {/* Địa chỉ */}
                      <Text style={[styles.td, styles.tdText, { flex: 2.4 }]} numberOfLines={2}>
                        {c.permanentAddress}
                      </Text>

                      {/* Nghề nghiệp */}
                      <Text style={[styles.td, styles.tdText, { flex: 1.4 }]} numberOfLines={1}>
                        {c.occupation}
                      </Text>

                      {/* Tag loại cư trú */}
                      <View style={[styles.td, { flex: 1.2 }]}>
                        <View style={[styles.tag, { backgroundColor: tagStyle.bg }]}>
                          <Text style={[styles.tagText, { color: tagStyle.color }]}>{c.citizenType}</Text>
                        </View>
                        {c.statusLabel ? (
                          <View style={styles.statusRow}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusLabelText}>{c.statusLabel}</Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Nút hành động */}
                      <View style={[styles.td, styles.actionCol]}>
                        <TouchableOpacity
                          style={styles.actionBtnView}
                          onPress={() =>
                            navigation.navigate('CitizenDetails', {
                              id: c.id,
                              citizenCode: c.citizenCode,
                              defaultName: c.fullName,
                            })
                          }
                          activeOpacity={0.75}
                          accessibilityLabel="Xem chi tiết hồ sơ công dân"
                        >
                          <ViewDetailsIcon size={18} color="#2563eb" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionBtnEdit}
                          onPress={() => navigation.navigate('EditCitizen', { citizen: c })}
                          activeOpacity={0.75}
                          accessibilityLabel="Chỉnh sửa thông tin công dân"
                        >
                          <EditCitizenIcon size={17} color="#d97706" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </View>

      {/* ── PHÂN TRANG ──────────────────────────────────────── */}
      <View style={styles.paginationCard}>
        <Text style={styles.paginationInfo}>
          Hiển thị <Text style={styles.paginationHighlight}>{citizenData.items.length}</Text> trong tổng số{' '}
          <Text style={styles.paginationHighlight}>{citizenData.totalElements}</Text> bản ghi • Trang {currentPage + 1}/
          {totalPages}
        </Text>

        <View style={styles.paginationBtns}>
          <TouchableOpacity
            style={[styles.pageBtn, (currentPage === 0 || isLoading) && styles.pageBtnDisabled]}
            disabled={currentPage === 0 || isLoading}
            onPress={() => handlePageChange(currentPage - 1)}
          >
            <Text style={[styles.pageBtnText, currentPage === 0 && styles.pageBtnTextDisabled]}>Trước</Text>
          </TouchableOpacity>

          {getPageNumbers(currentPage, totalPages).map((item, idx) => {
            if (typeof item === 'string') {
              const isStart = item === 'dots-start';
              return (
                <TouchableOpacity
                  key={`ellipsis-${idx}`}
                  style={styles.pageEllipsis}
                  disabled={isLoading}
                  onPress={() =>
                    handlePageChange(
                      isStart
                        ? Math.max(0, currentPage - 3)
                        : Math.min(totalPages - 1, currentPage + 3),
                    )
                  }
                  activeOpacity={0.6}
                >
                  <Text style={styles.pageEllipsisText}>...</Text>
                </TouchableOpacity>
              );
            }

            const pageIndex = item;
            const isActive = currentPage === pageIndex;

            return (
              <TouchableOpacity
                key={`page-${pageIndex}`}
                style={[styles.pageBtn, isActive && styles.pageBtnActive]}
                disabled={isLoading}
                onPress={() => handlePageChange(pageIndex)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pageBtnText, isActive && styles.pageBtnTextActive]}>
                  {pageIndex + 1}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.pageBtn, (currentPage >= totalPages - 1 || isLoading) && styles.pageBtnDisabled]}
            disabled={currentPage >= totalPages - 1 || isLoading}
            onPress={() => handlePageChange(currentPage + 1)}
          >
            <Text style={[styles.pageBtnText, currentPage >= totalPages - 1 && styles.pageBtnTextDisabled]}>Sau</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CitizensModule;

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 40 },
  toolbar: { flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' },

  // Ô tìm kiếm
  searchBox: {
    flex: 1,
    minWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchBoxActive: {
    borderColor: Colors.primary,
  },
  searchSpinnerWrapper: {
    marginRight: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  clearBtn: { padding: 4 },
  clearIcon: { fontSize: 13, color: Colors.textMuted },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: 'BeVietnamPro-Regular',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },

  // Chip bộ lọc
  filterTabs: { flexDirection: 'row', gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro-Medium',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontFamily: 'BeVietnamPro-Bold',
  },
  chipBadge: {
    backgroundColor: Colors.bgInput,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chipBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  chipBadgeText: {
    fontSize: 11,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
  },
  chipBadgeTextActive: {
    color: Colors.white,
  },

  // Toolbar Right
  toolbarRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.white,
    height: 44,
  },
  btnDisabled: { opacity: 0.6 },
  refreshIcon: { fontSize: 14, marginRight: 6 },
  refreshBtnText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'BeVietnamPro-Medium' },
  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: { fontSize: 14, color: Colors.white, fontFamily: 'BeVietnamPro-Bold' },

  // Table Card Container
  tableCardContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  scrollWrapper: { width: '100%' },
  tableInner: { width: '100%' },
  tableBody: { width: '100%' },

  // Thanh tiến trình trên đỉnh bảng (chạy trên GPU)
  progressBarTrack: {
    height: 3,
    backgroundColor: '#e0f2fe',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    width: 260,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  tableHead: {
    flexDirection: 'row',
    backgroundColor: Colors.bgInput,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  th: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tableRowAlt: { backgroundColor: '#fafafa' },
  td: { flex: 1, justifyContent: 'center' },
  tdText: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    fontFamily: 'BeVietnamPro-Regular',
    lineHeight: 18,
    maxHeight: 36,
  },

  // Avatar & chi tiết
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: { fontSize: 13, fontFamily: 'BeVietnamPro-Bold', color: Colors.primary },
  citizenName: { fontSize: 15, fontFamily: 'BeVietnamPro-SemiBold', color: Colors.textPrimary },
  citizenSub: { fontSize: 12, fontFamily: 'BeVietnamPro-Regular', color: Colors.textMuted, marginTop: 2 },
  cccdText: { fontSize: 14, fontFamily: 'BeVietnamPro-SemiBold', color: Colors.textPrimary },
  codeText: { fontSize: 12, fontFamily: 'BeVietnamPro-Regular', color: Colors.textMuted, marginTop: 2 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  tagText: { fontSize: 12, fontFamily: 'BeVietnamPro-SemiBold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16a34a' },
  statusLabelText: { fontSize: 11, color: '#16a34a', fontFamily: 'BeVietnamPro-Medium' },

  actionCol: {
    flex: 0.9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnView: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.18s ease-in-out',
      } as any,
    }),
  },
  actionBtnEdit: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fffbeb',
    borderWidth: 1.2,
    borderColor: '#fde68a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.18s ease-in-out',
      } as any,
    }),
  },

  // Empty state
  emptyContainer: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 32, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontFamily: 'BeVietnamPro-Bold', color: Colors.primaryDark, marginBottom: 4 },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'BeVietnamPro-Regular',
    textAlign: 'center',
    maxWidth: 360,
  },
  resetFilterBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetFilterText: { fontSize: 13, fontFamily: 'BeVietnamPro-Medium', color: Colors.primary },

  // Pagination
  paginationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationInfo: { fontSize: 13, fontFamily: 'BeVietnamPro-Regular', color: Colors.textMuted },
  paginationHighlight: { fontFamily: 'BeVietnamPro-Bold', color: Colors.textPrimary },
  paginationBtns: { flexDirection: 'row', gap: 6 },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  pageBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontSize: 13, fontFamily: 'BeVietnamPro-Medium', color: Colors.textSecondary },
  pageBtnTextActive: { color: Colors.white, fontFamily: 'BeVietnamPro-Bold' },
  pageBtnTextDisabled: { color: Colors.textMuted },
  pageEllipsis: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pageEllipsisText: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});
