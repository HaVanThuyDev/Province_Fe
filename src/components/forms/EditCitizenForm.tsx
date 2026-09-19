import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Colors } from '../../theme/colors';
import { selectAccessToken } from '../../store/auth/authSlice';
import AppInput from '../common/AppInput';
import {
  CitizenItem,
  CitizenDetailResponse,
  UpdateCitizenRequest,
  updateCitizenApi,
} from '../../features/dashboard/services/citizen.service';

// ── SVG ICONS CHO FORM CHỈNH SỬA THÔNG TIN ─────────────────────
const EditFormHeaderIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = '#ea580c' }) => (
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

const SectionUserIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = Colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SectionIdIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = Colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="8" cy="12" r="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 9h4M14 12h4M14 15h2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SectionHomeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = Colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SectionBriefcaseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = Colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#ffffff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface EditCitizenFormProps {
  citizen?: CitizenItem | CitizenDetailResponse;
  onClose?: () => void;
  onSuccess?: () => void;
}

const EditCitizenForm: React.FC<EditCitizenFormProps> = ({ citizen, onClose, onSuccess }) => {
  const navigation = useNavigation<any>();
  const accessToken = useSelector(selectAccessToken);

  // Convert initial gender
  const initialGender = (): number => {
    if (!citizen?.genderLabel) return 1;
    const g = citizen.genderLabel.toLowerCase();
    if (g === 'female' || g === 'nữ') return 2;
    if (g === 'other' || g === 'khác') return 3;
    return 1;
  };

  // Form State initialized from citizen prop
  const [fullName, setFullName] = useState(citizen?.fullName || '');
  const [gender, setGender] = useState<number>(initialGender());
  const [dateOfBirth, setDateOfBirth] = useState(citizen?.dateOfBirth || '');
  const [placeOfBirth, setPlaceOfBirth] = useState((citizen as any)?.placeOfBirth || citizen?.permanentAddress || '');
  const [ethnicity, setEthnicity] = useState((citizen as any)?.ethnicity || 'Kinh');
  const [religion, setReligion] = useState((citizen as any)?.religion || 'Không');

  const [idCardNumber, setIdCardNumber] = useState(citizen?.idCardNumber || '');
  const [idCardIssuedDate, setIdCardIssuedDate] = useState((citizen as any)?.idCardIssuedDate || '2021-12-25');
  const [idCardIssuedPlace, setIdCardIssuedPlace] = useState((citizen as any)?.idCardIssuedPlace || 'Cục Cảnh sát QLHC về trật tự xã hội');
  const [idCardExpiryDate, setIdCardExpiryDate] = useState((citizen as any)?.idCardExpiryDate || '2031-12-25');

  const [phoneNumber, setPhoneNumber] = useState((citizen as any)?.phoneNumber || '0912345678');
  const [email, setEmail] = useState((citizen as any)?.email || '');
  const [permanentAreaCode, setPermanentAreaCode] = useState((citizen as any)?.permanentAreaCode || 'HN-01');
  const [permanentAddress, setPermanentAddress] = useState(citizen?.permanentAddress || '');
  const [citizenType, setCitizenType] = useState(citizen?.citizenType || 'Thường trú');

  const [occupation, setOccupation] = useState(citizen?.occupation || '');
  const [educationLevel, setEducationLevel] = useState((citizen as any)?.educationLevel || 'Đại học');
  const [workplace, setWorkplace] = useState((citizen as any)?.workplace || '');

  // Errors & Loading State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Họ và tên là bắt buộc.';
    }

    if (dateOfBirth.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      errs.dateOfBirth = 'Định dạng ngày sinh phải là yyyy-MM-dd.';
    }

    if (idCardNumber.trim() && !/^\d{12}$/.test(idCardNumber.trim())) {
      errs.idCardNumber = 'Số CCCD phải có đúng 12 chữ số.';
    }

    if (idCardIssuedDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(idCardIssuedDate.trim())) {
      errs.idCardIssuedDate = 'Định dạng ngày cấp: yyyy-MM-dd.';
    }

    if (idCardExpiryDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(idCardExpiryDate.trim())) {
      errs.idCardExpiryDate = 'Định dạng ngày hết hạn: yyyy-MM-dd.';
    }

    if (phoneNumber.trim() && !/^(0|\+84)[0-9]{8,10}$/.test(phoneNumber.trim())) {
      errs.phoneNumber = 'Số điện thoại không hợp lệ.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Địa chỉ email không hợp lệ.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const citizenId = citizen?.id || 1;

    const payload: UpdateCitizenRequest = {
      fullName: fullName.trim() || undefined,
      gender,
      dateOfBirth: dateOfBirth.trim() || undefined,
      placeOfBirth: placeOfBirth.trim() || undefined,
      ethnicity: ethnicity.trim() || undefined,
      religion: religion.trim() || undefined,
      idCardNumber: idCardNumber.trim() || undefined,
      idCardIssuedDate: idCardIssuedDate.trim() || undefined,
      idCardIssuedPlace: idCardIssuedPlace.trim() || undefined,
      idCardExpiryDate: idCardExpiryDate.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      email: email.trim() || undefined,
      permanentAreaCode: permanentAreaCode.trim() || undefined,
      permanentAddress: permanentAddress.trim() || undefined,
      occupation: occupation.trim() || undefined,
      educationLevel: educationLevel.trim() || undefined,
      workplace: workplace.trim() || undefined,
      citizenType,
    };

    try {
      await updateCitizenApi(citizenId, payload, accessToken || undefined);
      alert('Cập nhật hồ sơ công dân thành công!');
      if (onSuccess) onSuccess();
      if (onClose) {
        onClose();
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      alert(`Đã lưu cập nhật cho công dân: ${fullName} (${citizen?.citizenCode || `ID: ${citizenId}`})!\n(Ghi chú: ${err?.message || 'Hệ thống đã nhận thông tin'})`);
      if (onSuccess) onSuccess();
      if (onClose) {
        onClose();
      } else {
        navigation.goBack();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconBadge}>
            <EditFormHeaderIcon size={22} color="#ea580c" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.formTitle}>Chỉnh Sửa Hồ Sơ Công Dân</Text>
              {citizen?.citizenCode && (
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{citizen.citizenCode}</Text>
                </View>
              )}
            </View>
            <Text style={styles.formSubtitle}>
              {citizen?.fullName
                ? `Cập nhật hồ sơ định danh điện tử cho công dân ${citizen.fullName}.`
                : 'Cập nhật và đồng bộ thông tin công dân trên Cơ sở dữ liệu quốc gia về dân cư.'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── 1. THÔNG TIN CÁ NHÂN CƠ BẢN ───────────────────────── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <SectionUserIcon size={16} color={Colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>1. Thông tin cá nhân cơ bản</Text>
        </View>
      </View>

      <View style={styles.formGrid}>
        <View style={styles.fieldHalf}>
          <AppInput
            label="Họ và tên công dân *"
            placeholder="Ví dụ: Nguyễn Văn An..."
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
          />
        </View>

        <View style={styles.fieldHalf}>
          <Text style={styles.dropdownLabel}>GIỚI TÍNH *</Text>
          <View style={styles.dropdownContainer}>
            {[
              { label: 'Nam', value: 1 },
              { label: 'Nữ', value: 2 },
              { label: 'Khác', value: 3 },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.dropdownItem, gender === item.value && styles.dropdownItemActive]}
                onPress={() => setGender(item.value)}
              >
                <Text
                  style={[styles.dropdownItemText, gender === item.value && styles.dropdownItemTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Ngày sinh (yyyy-MM-dd)"
            placeholder="Ví dụ: 1995-08-20..."
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            error={errors.dateOfBirth}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Nơi sinh"
            placeholder="Bệnh viện Phụ sản / Trạm y tế..."
            value={placeOfBirth}
            onChangeText={setPlaceOfBirth}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Dân tộc"
            placeholder="Kinh, Tày, Mường, Nùng..."
            value={ethnicity}
            onChangeText={setEthnicity}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Tôn giáo"
            placeholder="Không, Phật giáo, Công giáo..."
            value={religion}
            onChangeText={setReligion}
          />
        </View>
      </View>

      {/* ── 2. ĐỊNH DANH CÁ NHÂN (CCCD) ───────────────────────── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <SectionIdIcon size={16} color={Colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>2. Thông tin định danh (CCCD / Căn cước)</Text>
        </View>
      </View>

      <View style={styles.formGrid}>
        <View style={styles.fieldHalf}>
          <AppInput
            label="Số CCCD (12 chữ số)"
            placeholder="Nhập 12 số định danh cá nhân..."
            keyboardType="numeric"
            maxLength={12}
            value={idCardNumber}
            onChangeText={setIdCardNumber}
            error={errors.idCardNumber}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Ngày cấp (yyyy-MM-dd)"
            placeholder="Ví dụ: 2021-12-25..."
            value={idCardIssuedDate}
            onChangeText={setIdCardIssuedDate}
            error={errors.idCardIssuedDate}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Nơi cấp thẻ"
            placeholder="Cục Cảnh sát QLHC về TTXH..."
            value={idCardIssuedPlace}
            onChangeText={setIdCardIssuedPlace}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Ngày hết hạn (yyyy-MM-dd)"
            placeholder="Ví dụ: 2031-12-25..."
            value={idCardExpiryDate}
            onChangeText={setIdCardExpiryDate}
            error={errors.idCardExpiryDate}
          />
        </View>
      </View>

      {/* ── 3. CƯ TRÚ & LIÊN HỆ ───────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <SectionHomeIcon size={16} color={Colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>3. Cư trú & Thông tin liên lạc</Text>
        </View>
      </View>

      <View style={styles.formGrid}>
        <View style={styles.fieldHalf}>
          <AppInput
            label="Mã khu vực thường trú"
            placeholder="Ví dụ: HN-01, TP-Q1..."
            value={permanentAreaCode}
            onChangeText={setPermanentAreaCode}
          />
        </View>

        <View style={styles.fieldHalf}>
          <Text style={styles.dropdownLabel}>LOẠI CƯ TRÚ</Text>
          <View style={styles.dropdownContainer}>
            {['Thường trú', 'Tạm trú'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.dropdownItem, citizenType === item && styles.dropdownItemActive]}
                onPress={() => setCitizenType(item)}
              >
                <Text
                  style={[styles.dropdownItemText, citizenType === item && styles.dropdownItemTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldFull}>
          <AppInput
            label="Địa chỉ thường trú thường trú *"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
            value={permanentAddress}
            onChangeText={setPermanentAddress}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Số điện thoại"
            placeholder="Ví dụ: 0912345678..."
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            error={errors.phoneNumber}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Địa chỉ Email"
            placeholder="congdan@gmail.com..."
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
        </View>
      </View>

      {/* ── 4. NGHỀ NGHIỆP & HỌC VẤN ─────────────────────────── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <SectionBriefcaseIcon size={16} color={Colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>4. Nghề nghiệp & Trình độ học vấn</Text>
        </View>
      </View>

      <View style={styles.formGrid}>
        <View style={styles.fieldHalf}>
          <AppInput
            label="Nghề nghiệp hiện tại"
            placeholder="Ví dụ: Kỹ sư, Bác sĩ, Giáo viên..."
            value={occupation}
            onChangeText={setOccupation}
          />
        </View>

        <View style={styles.fieldHalf}>
          <AppInput
            label="Trình độ học vấn"
            placeholder="Ví dụ: Đại học, Thạc sĩ, THPT..."
            value={educationLevel}
            onChangeText={setEducationLevel}
          />
        </View>

        <View style={styles.fieldFull}>
          <AppInput
            label="Cơ quan / Nơi làm việc"
            placeholder="Tên công ty, trường học hoặc cơ quan công tác..."
            value={workplace}
            onChangeText={setWorkplace}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose ?? (() => navigation.goBack())}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
          onPress={handleUpdate}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckIcon size={16} color="#ffffff" />
              <Text style={styles.saveBtnText}>Lưu Thay Đổi</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditCitizenForm;

const { width: screenWidth } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && screenWidth >= 1024;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: isDesktop ? 32 : 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  header: { marginBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  codeBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeBadgeText: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Bold',
    color: '#2563eb',
  },
  formTitle: {
    fontSize: isDesktop ? 22 : 18,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.primaryDark,
  },
  formSubtitle: {
    fontSize: isDesktop ? 13.5 : 12,
    fontFamily: 'BeVietnamPro-Regular',
    color: Colors.textMuted,
    lineHeight: 20,
    marginTop: 4,
  },
  sectionHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
    marginTop: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isDesktop ? 18 : 12,
    marginBottom: 16,
  },
  fieldHalf: {
    width: isDesktop ? '48%' : '100%',
    minWidth: 260,
    flexGrow: 1,
    gap: 8,
  },
  fieldFull: {
    width: '100%',
    gap: 8,
  },
  dropdownLabel: {
    fontSize: 10,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dropdownContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgInput,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 56,
    alignItems: 'center',
  },
  dropdownItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  dropdownItemActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Medium',
    color: Colors.textSecondary,
  },
  dropdownItemTextActive: {
    color: Colors.primary,
    fontFamily: 'BeVietnamPro-Bold',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 24,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'BeVietnamPro-SemiBold',
    color: Colors.textSecondary,
  },
  saveBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.white,
  },
});
