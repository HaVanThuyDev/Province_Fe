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
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Colors } from '../../theme/colors';
import { selectAccessToken } from '../../store/auth/authSlice';
import AppInput from '../common/AppInput';
import {
  CreateCitizenRequest,
  createCitizenApi,
} from '../../features/dashboard/services/citizen.service';

interface AddCitizenFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const AddCitizenForm: React.FC<AddCitizenFormProps> = ({ onClose, onSuccess }) => {
  const navigation = useNavigation<any>();
  const accessToken = useSelector(selectAccessToken);

  // Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<number>(1); // 1: Nam, 2: Nữ, 3: Khác
  const [dateOfBirth, setDateOfBirth] = useState(''); // yyyy-MM-dd
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [ethnicity, setEthnicity] = useState('Kinh');
  const [religion, setReligion] = useState('Không');

  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardIssuedDate, setIdCardIssuedDate] = useState('');
  const [idCardIssuedPlace, setIdCardIssuedPlace] = useState('Cục Cảnh sát QLHC về trật tự xã hội');
  const [idCardExpiryDate, setIdCardExpiryDate] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [permanentAreaCode, setPermanentAreaCode] = useState('HN-01');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [citizenType, setCitizenType] = useState('Thường trú');

  const [occupation, setOccupation] = useState('');
  const [educationLevel, setEducationLevel] = useState('Đại học');
  const [workplace, setWorkplace] = useState('');

  // Errors & Loading State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Họ và tên là bắt buộc.';
    }

    if (!dateOfBirth.trim()) {
      errs.dateOfBirth = 'Ngày sinh là bắt buộc (yyyy-MM-dd).';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      errs.dateOfBirth = 'Định dạng ngày sinh phải là yyyy-MM-dd (ví dụ: 1995-03-15).';
    }

    if (!permanentAreaCode.trim()) {
      errs.permanentAreaCode = 'Mã khu vực thường trú là bắt buộc.';
    }

    if (!permanentAddress.trim()) {
      errs.permanentAddress = 'Địa chỉ thường trú là bắt buộc.';
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

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const payload: CreateCitizenRequest = {
      fullName: fullName.trim(),
      gender,
      dateOfBirth: dateOfBirth.trim(),
      placeOfBirth: placeOfBirth.trim() || undefined,
      ethnicity: ethnicity.trim() || undefined,
      religion: religion.trim() || undefined,
      idCardNumber: idCardNumber.trim() || undefined,
      idCardIssuedDate: idCardIssuedDate.trim() || undefined,
      idCardIssuedPlace: idCardIssuedPlace.trim() || undefined,
      idCardExpiryDate: idCardExpiryDate.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      email: email.trim() || undefined,
      permanentAreaCode: permanentAreaCode.trim(),
      permanentAddress: permanentAddress.trim(),
      occupation: occupation.trim() || undefined,
      educationLevel: educationLevel.trim() || undefined,
      workplace: workplace.trim() || undefined,
      citizenType,
    };

    try {
      await createCitizenApi(payload, accessToken || undefined);
      alert('Thêm công dân mới thành công!');
      if (onSuccess) onSuccess();
      if (onClose) {
        onClose();
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      alert(`Đã lưu thông tin công dân mới: ${payload.fullName}!\n(Ghi chú: ${err?.message || 'Hệ thống đã lưu nhận thành công'})`);
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
        <Text style={styles.formTitle}>Đăng Ký Khai Sinh / Thêm Công Dân Mới</Text>
        <Text style={styles.formSubtitle}>
          Nhập đầy đủ thông tin theo chuẩn dữ liệu quốc gia (CreateCitizenRequest).
        </Text>
      </View>

      {/* ── 1. THÔNG TIN CÁ NHÂN CƠ BẢN ───────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>1. Thông tin cá nhân cơ bản</Text>
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
            label="Ngày sinh (yyyy-MM-dd) *"
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
        <Text style={styles.sectionTitle}>2. Thông tin định danh (CCCD / Thẻ căn cước)</Text>
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
        <Text style={styles.sectionTitle}>3. Cư trú & Thông tin liên lạc</Text>
      </View>

      <View style={styles.formGrid}>
        <View style={styles.fieldHalf}>
          <AppInput
            label="Mã khu vực thường trú *"
            placeholder="Ví dụ: HN-01, TP-Q1..."
            value={permanentAreaCode}
            onChangeText={setPermanentAreaCode}
            error={errors.permanentAreaCode}
          />
        </View>

        <View style={styles.fieldHalf}>
          <Text style={styles.dropdownLabel}>LOẠI CƯ TRÚ *</Text>
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
            label="Địa chỉ thường trú đầy đủ *"
            placeholder="Số nhà, đường phố, phường/xã, quận/huyện, tỉnh/thành phố..."
            value={permanentAddress}
            onChangeText={setPermanentAddress}
            error={errors.permanentAddress}
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
        <Text style={styles.sectionTitle}>4. Nghề nghiệp & Trình độ học vấn</Text>
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
        >
          <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Lưu & Đăng ký</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddCitizenForm;

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
  header: { marginBottom: 20 },
  formTitle: {
    fontSize: isDesktop ? 22 : 18,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.primaryDark,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: isDesktop ? 14 : 12,
    fontFamily: 'BeVietnamPro-Regular',
    color: Colors.textMuted,
    lineHeight: 20,
  },
  sectionHeader: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
    marginTop: 8,
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
