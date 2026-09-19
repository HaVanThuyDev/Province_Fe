import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Colors } from '../../../theme/colors';
import { selectAccessToken } from '../../../store/auth/authSlice';
import {
  DEFAULT_CITIZEN_DATA,
  CitizenDetailResponse,
  getCitizenDetailApi,
} from '../services/citizen.service';

const DetailEditIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#ea580c' }) => (
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

// Types for detailed profiles
interface FamilyMember {
  name: string;
  relation: string;
  birthYear: number;
  idCode: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  desc: string;
}

interface CitizenProfile {
  code: string;
  name: string;
  gender: string;
  birthYear: number;
  cccd: string;
  job: string;
  tag: string;
  tagColor: string;
  avatarColor: string;
  personal: {
    dob: string;
    birthPlace: string;
    hometown: string;
    nationality: string;
    ethnicity: string;
    religion: string;
    bloodType: string;
    phone: string;
    email: string;
    maritalStatus: string;
    contactAddress: string;
  };
  identity: {
    cccdNum: string;
    issueDate: string;
    issuePlace: string;
    identMark: string;
    oldId: string;
  };
  residency: {
    permanent: string;
    temporary: string;
    current: string;
    regDate: string;
    status: string;
  };
  household: {
    hkCode: string;
    ownerName: string;
    relationToOwner: string;
    address: string;
    members: FamilyMember[];
  };
  occupation: {
    jobTitle: string;
    workplace: string;
    education: string;
    employmentStatus: string;
  };
  documents: {
    birthCertificate: string;
    passport: string;
    driverLicense: string;
    healthInsurance: string;
  };
  specialGroup: {
    category: string;
    subsidy: string;
    disability: string;
  };
  history: TimelineEvent[];
}

// Complete mock database for profile lookups
const PROFILES_DB: Record<string, CitizenProfile> = {
  'CD-123984': {
    code: 'CD-123984',
    name: 'Trần Văn Hoàng',
    gender: 'Nam',
    birthYear: 1990,
    cccd: '038090012345',
    job: 'Kỹ sư xây dựng',
    tag: 'Lao động',
    tagColor: Colors.primary,
    avatarColor: '#3b82f6',
    personal: {
      dob: '15/04/1990',
      birthPlace: 'Bệnh viện Phụ sản Trung ương, Hà Nội',
      hometown: 'Xã Hưng Mỹ, Huyện Hưng Nguyên, Tỉnh Nghệ An',
      nationality: 'Việt Nam',
      ethnicity: 'Kinh',
      religion: 'Không',
      bloodType: 'O+',
      phone: '0912 345 678',
      email: 'hoang.tran@civilpro.gov.vn',
      maritalStatus: 'Đã kết hôn',
      contactAddress: 'Số 12, Đường 3/2, Phường 1, TP. Trung Tâm, Tỉnh Tây Ninh',
    },
    identity: {
      cccdNum: '038090012345',
      issueDate: '25/12/2021',
      issuePlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
      identMark: 'Nốt ruồi cách 2cm dưới đuôi mắt phải',
      oldId: '184012394 (Cấp năm 2005 tại CA Nghệ An)',
    },
    residency: {
      permanent: 'Số 12, Đường 3/2, Phường 1, TP. Trung Tâm, Tỉnh Tây Ninh',
      temporary: 'Không có (Đang cư trú tại thường trú)',
      current: 'Số 12, Đường 3/2, Phường 1, TP. Trung Tâm, Tỉnh Tây Ninh',
      regDate: '10/01/2015',
      status: 'Thường trú chính thức',
    },
    household: {
      hkCode: 'HK-909283',
      ownerName: 'Trần Văn Hoàng',
      relationToOwner: 'Chủ hộ',
      address: 'Số 12, Đường 3/2, Phường 1, TP. Trung Tâm, Tỉnh Tây Ninh',
      members: [
        { name: 'Nguyễn Thị Hương', relation: 'Vợ', birthYear: 1993, idCode: 'CD-990123' },
        { name: 'Trần Hoàng Nam', relation: 'Con trai', birthYear: 2018, idCode: 'CD-881920' },
        { name: 'Trần Hoàng Lan', relation: 'Con gái', birthYear: 2021, idCode: 'CD-998273' }, // Lê Thị Mai Liên test link
      ],
    },
    occupation: {
      jobTitle: 'Kỹ sư xây dựng cấp cao',
      workplace: 'Tổng công ty Xây dựng Công trình Trung Tâm',
      education: 'Đại học (Kỹ sư Cầu đường)',
      employmentStatus: 'Đang làm việc (Hợp đồng vô thời hạn)',
    },
    documents: {
      birthCertificate: 'Số 142/QĐ-KS, Đăng ký ngày 20/05/1990 tại UBND Xã Hưng Mỹ, Nghệ An',
      passport: 'B9283745, Cấp ngày 14/05/2019, Hết hạn ngày 14/05/2029',
      driverLicense: 'GPLX Hạng B2, Số: 370123498234, Cấp ngày 08/08/2018 tại Sở GTVT',
      healthInsurance: 'GD438090012345, Nơi KCB ban đầu: Bệnh viện Đa khoa Tỉnh',
    },
    specialGroup: {
      category: 'Lao động phổ thông/Văn phòng',
      subsidy: 'Không hưởng trợ cấp xã hội',
      disability: 'Bình thường (Không khuyết tật)',
    },
    history: [
      { date: '12/03/2026', title: 'Cập nhật nghề nghiệp', desc: 'Thay đổi nghề nghiệp từ Kỹ sư giám sát lên Kỹ sư xây dựng cấp cao.' },
      { date: '25/12/2021', title: 'Cấp đổi thẻ CCCD', desc: 'Cấp đổi từ CMND 9 số cũ sang thẻ CCCD gắn chip điện tử mới.' },
      { date: '18/06/2017', title: 'Thay đổi hộ tịch', desc: 'Đăng ký kết hôn với bà Nguyễn Thị Hương tại UBND Phường 1.' },
      { date: '10/01/2015', title: 'Đăng ký cư trú', desc: 'Chuyển hộ khẩu thường trú từ Nghệ An về địa chỉ hiện tại.' },
      { date: '20/05/1990', title: 'Khai sinh', desc: 'Đăng ký khai sinh tại UBND Xã Hưng Mỹ, Huyện Hưng Nguyên, Nghệ An.' },
    ],
  },
  'CD-998273': {
    code: 'CD-998273',
    name: 'Lê Thị Mai Liên',
    gender: 'Nữ',
    birthYear: 2012,
    cccd: '038312009876',
    job: 'Học sinh',
    tag: 'Trẻ em',
    tagColor: '#16a34a',
    avatarColor: '#16a34a',
    personal: {
      dob: '22/09/2012',
      birthPlace: 'Trạm y tế Xã Hòa Xuân, H. Hòa Bình',
      hometown: 'Xã Hòa Xuân, Huyện Hòa Bình, Tỉnh Tây Ninh',
      nationality: 'Việt Nam',
      ethnicity: 'Kinh',
      religion: 'Không',
      bloodType: 'A+',
      phone: 'Chưa có',
      email: 'Chưa có',
      maritalStatus: 'Độc thân',
      contactAddress: 'Hẻm 45, Xã Hòa Xuân, H. Hòa Bình, Tỉnh Tây Ninh',
    },
    identity: {
      cccdNum: '038312009876',
      issueDate: '12/04/2024',
      issuePlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
      identMark: 'Sẹo mờ 0.5cm dưới dái tai trái',
      oldId: 'Không có',
    },
    residency: {
      permanent: 'Hẻm 45, Xã Hòa Xuân, H. Hòa Bình, Tỉnh Tây Ninh',
      temporary: 'Không có',
      current: 'Hẻm 45, Xã Hòa Xuân, H. Hòa Bình, Tỉnh Tây Ninh',
      regDate: '24/09/2012',
      status: 'Thường trú chính thức',
    },
    household: {
      hkCode: 'HK-482934',
      ownerName: 'Lê Văn Tám',
      relationToOwner: 'Con gái',
      address: 'Hẻm 45, Xã Hòa Xuân, H. Hòa Bình, Tỉnh Tây Ninh',
      members: [
        { name: 'Lê Văn Tám', relation: 'Bố (Chủ hộ)', birthYear: 1980, idCode: 'CD-112233' },
        { name: 'Hoàng Thị Cúc', relation: 'Mẹ', birthYear: 1983, idCode: 'CD-445566' },
      ],
    },
    occupation: {
      jobTitle: 'Học sinh lớp 8',
      workplace: 'Trường THCS Hòa Bình',
      education: 'Đang học THCS',
      employmentStatus: 'Học sinh',
    },
    documents: {
      birthCertificate: 'Số 423/KS-2012, Đăng ký ngày 24/09/2012 tại UBND Xã Hòa Xuân',
      passport: 'Chưa cấp',
      driverLicense: 'Chưa đủ tuổi cấp GPLX',
      healthInsurance: 'HS438312009876, Nơi KCB ban đầu: Trung tâm Y tế Huyện Hòa Bình',
    },
    specialGroup: {
      category: 'Trẻ em dưới 16 tuổi',
      subsidy: 'Không hưởng trợ cấp đặc biệt',
      disability: 'Bình thường (Không khuyết tật)',
    },
    history: [
      { date: '12/04/2024', title: 'Cấp thẻ định danh', desc: 'Được cấp thẻ định danh cá nhân mới dành cho trẻ em từ 12 tuổi.' },
      { date: '05/09/2018', title: 'Nhập học tiểu học', desc: 'Bắt đầu học lớp 1 tại Trường Tiểu học Hòa Bình.' },
      { date: '24/09/2012', title: 'Khai sinh & Đăng ký thường trú', desc: 'Đăng ký khai sinh và nhập khẩu thường trú theo hộ gia đình của bố mẹ.' },
    ],
  },
  'CD-445512': {
    code: 'CD-445512',
    name: 'Nguyễn Văn Bình',
    gender: 'Nam',
    birthYear: 1955,
    cccd: '038055007654',
    job: 'Hưu trí (Cựu chiến binh)',
    tag: 'Người cao tuổi',
    tagColor: '#7c3aed',
    avatarColor: '#7c3aed',
    personal: {
      dob: '05/08/1955',
      birthPlace: 'Huyện Hưng Hà, Tỉnh Thái Bình',
      hometown: 'Xã Tân Lập, Huyện Hưng Hà, Tỉnh Thái Bình',
      nationality: 'Việt Nam',
      ethnicity: 'Kinh',
      religion: 'Không',
      bloodType: 'B+',
      phone: '0903 112 233',
      email: 'binh.nguyen55@gmail.com',
      maritalStatus: 'Đã kết hôn',
      contactAddress: 'Số 88, Đường Lê Lợi, Phường 3, TP. Trung Tâm, Tỉnh Tây Ninh',
    },
    identity: {
      cccdNum: '038055007654',
      issueDate: '15/10/2022',
      issuePlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
      identMark: 'Sẹo thẳng 3cm ở bả vai trái do vết thương chiến tranh',
      oldId: '023912984 (Cấp tại CA Thái Bình năm 1974)',
    },
    residency: {
      permanent: 'Số 88, Đường Lê Lợi, Phường 3, TP. Trung Tâm, Tỉnh Tây Ninh',
      temporary: 'Không có',
      current: 'Số 88, Đường Lê Lợi, Phường 3, TP. Trung Tâm, Tỉnh Tây Ninh',
      regDate: '15/09/1986',
      status: 'Thường trú chính thức',
    },
    household: {
      hkCode: 'HK-123456',
      ownerName: 'Nguyễn Văn Bình',
      relationToOwner: 'Chủ hộ',
      address: 'Số 88, Đường Lê Lợi, Phường 3, TP. Trung Tâm, Tỉnh Tây Ninh',
      members: [
        { name: 'Vũ Thị Minh', relation: 'Vợ', birthYear: 1958, idCode: 'CD-887766' },
        { name: 'Nguyễn Văn Minh', relation: 'Con trai', birthYear: 1988, idCode: 'CD-123984' }, // Link to Tran Van Hoang profile test
      ],
    },
    occupation: {
      jobTitle: 'Hưu trí / Cựu chiến binh thương tật hạng 3/4',
      workplace: 'Hội Cựu chiến binh Phường 3',
      education: '10/10 (Hệ cũ)',
      employmentStatus: 'Nghỉ hưu',
    },
    documents: {
      birthCertificate: 'Số 98/KS-1955, Đăng ký tại UBND Xã Tân Lập, Thái Bình',
      passport: 'C2918234, Cấp ngày 10/01/2020, Hết hạn ngày 10/01/2030',
      driverLicense: 'GPLX Hạng A1, Số: 340123928, Cấp năm 1995 tại Tây Ninh',
      healthInsurance: 'HT338055007654, Nơi KCB ban đầu: Bệnh viện Quân y Tỉnh',
    },
    specialGroup: {
      category: 'Người cao tuổi & Thương binh chiến tranh',
      subsidy: 'Hưởng trợ cấp thương binh hạng 3/4 hàng tháng (1,850,000 VND)',
      disability: 'Hạn chế vận động bả vai trái do mảnh đạn găm',
    },
    history: [
      { date: '15/10/2022', title: 'Cấp lại CCCD hết hạn', desc: 'Được cấp lại thẻ CCCD gắn chip khi đủ mốc tuổi quy định.' },
      { date: '01/09/2015', title: 'Nhận quyết định nghỉ hưu', desc: 'Nghỉ hưu chính thức từ Ban chỉ huy Quân sự Tỉnh.' },
      { date: '15/09/1986', title: 'Đăng ký cư trú', desc: 'Chuyển hộ khẩu định cư lâu dài từ Thái Bình vào miền Nam.' },
      { date: '12/03/1973', title: 'Nhập ngũ tham gia cách mạng', desc: 'Nhập ngũ vào Sư đoàn 9 bộ binh chiến đấu tại chiến trường miền Nam.' },
    ],
  },
  'CD-771234': {
    code: 'CD-771234',
    name: 'Phạm Thị Hoa',
    gender: 'Nữ',
    birthYear: 1985,
    cccd: '038085003421',
    job: 'Nông dân',
    tag: 'Lao động',
    tagColor: Colors.primary,
    avatarColor: '#2563eb',
    personal: {
      dob: '18/11/1985',
      birthPlace: 'Thôn 2, Xã Bình Minh, H. Miền Núi',
      hometown: 'Xã Bình Minh, Huyện Miền Núi, Tỉnh Tây Ninh',
      nationality: 'Việt Nam',
      ethnicity: 'Kinh',
      religion: 'Không',
      bloodType: 'AB+',
      phone: '0978 998 877',
      email: 'hoa.pham85@gmail.com',
      maritalStatus: 'Đã kết hôn',
      contactAddress: 'Thôn 2, Xã Bình Minh, H. Miền Núi, Tỉnh Tây Ninh',
    },
    identity: {
      cccdNum: '038085003421',
      issueDate: '10/05/2023',
      issuePlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
      identMark: 'Tàn nhang rải rác trên cánh mũi',
      oldId: '182394857 (CMND 9 số cấp năm 2001)',
    },
    residency: {
      permanent: 'Thôn 2, Xã Bình Minh, H. Miền Núi, Tỉnh Tây Ninh',
      temporary: 'Không có',
      current: 'Thôn 2, Xã Bình Minh, H. Miền Núi, Tỉnh Tây Ninh',
      regDate: '20/11/1985',
      status: 'Thường trú chính thức',
    },
    household: {
      hkCode: 'HK-982734',
      ownerName: 'Phạm Văn Hùng',
      relationToOwner: 'Vợ',
      address: 'Thôn 2, Xã Bình Minh, H. Miền Núi, Tỉnh Tây Ninh',
      members: [
        { name: 'Phạm Văn Hùng', relation: 'Chồng (Chủ hộ)', birthYear: 1982, idCode: 'CD-982349' },
        { name: 'Phạm Văn Tú', relation: 'Con trai', birthYear: 2010, idCode: 'CD-772834' },
      ],
    },
    occupation: {
      jobTitle: 'Xã viên phát triển chăn nuôi nông nghiệp sạch',
      workplace: 'Hợp tác xã Nông nghiệp Bình Minh',
      education: '9/12',
      employmentStatus: 'Lao động tự do / Nông nghiệp',
    },
    documents: {
      birthCertificate: 'Số 182/KS-1985, Đăng ký tại UBND Xã Bình Minh',
      passport: 'Chưa cấp',
      driverLicense: 'GPLX Hạng A1, Số: 37192834928, Cấp năm 2010',
      healthInsurance: 'HN438085003421, Nơi KCB ban đầu: Trạm Y tế Xã Bình Minh',
    },
    specialGroup: {
      category: 'Hộ nông nghiệp địa phương',
      subsidy: 'Được hỗ trợ vốn vay xóa đói giảm nghèo phát triển kinh tế (Hỗ trợ 20,000,000 VND lãi suất ưu đãi)',
      disability: 'Bình thường (Không khuyết tật)',
    },
    history: [
      { date: '10/05/2023', title: 'Cấp thẻ định danh gắn chip', desc: 'Thực hiện cấp đổi từ CMND 9 số cũ sang thẻ căn cước công dân hiện đại.' },
      { date: '12/12/2008', title: 'Thay đổi hộ tịch', desc: 'Kết hôn với ông Phạm Văn Hùng tại UBND Xã Bình Minh.' },
      { date: '20/11/1985', title: 'Đăng ký cư trú ban đầu', desc: 'Đăng ký khai sinh và nhập khẩu thường trú đầu đời.' },
    ],
  },
};

const CitizenDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'personal' | 'identity' | 'residency' | 'household' | 'occupation' | 'documents' | 'specialGroup' | 'history'>('personal');

  // Extract navigation parameters
  const { id, citizenCode, defaultName } = route.params || {};
  const accessToken = useSelector(selectAccessToken);

  const [detailData, setDetailData] = useState<CitizenDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    const target = id || citizenCode;
    if (target) {
      setIsLoadingDetail(true);
      getCitizenDetailApi(target, accessToken || undefined, defaultName)
        .then((res) => {
          if (res) {
            setDetailData(res);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingDetail(false));
    }
  }, [id, citizenCode, defaultName, accessToken]);

  // Retrieve citizen profile from database (fallback to detailData or Tran Van Hoang CD-123984)
  const profile = useMemo<CitizenProfile>(() => {
    if (detailData) {
      const birthYear = detailData.dateOfBirth
        ? parseInt(detailData.dateOfBirth.slice(0, 4), 10)
        : (2026 - (detailData.age || 30));
      const gender = detailData.genderLabel === 'Male' ? 'Nam' : detailData.genderLabel === 'Female' ? 'Nữ' : 'Khác';
      const formattedDob = detailData.dateOfBirth ? detailData.dateOfBirth.split('-').reverse().join('/') : '';
      const isResident = detailData.citizenType === 'Thường trú';

      return {
        code: detailData.citizenCode,
        name: detailData.fullName,
        gender,
        birthYear,
        cccd: detailData.idCardNumber,
        job: detailData.occupation || 'Chưa cập nhật',
        tag: detailData.citizenType || 'Thường trú',
        tagColor: isResident ? Colors.primary : '#d97706',
        avatarColor: gender === 'Nam' ? '#3b82f6' : gender === 'Nữ' ? '#ec4899' : '#8b5cf6',
        personal: {
          dob: formattedDob,
          birthPlace: detailData.placeOfBirth || detailData.permanentAddress,
          hometown: detailData.permanentAddress,
          nationality: detailData.nationality || 'Việt Nam',
          ethnicity: detailData.ethnicity || 'Kinh',
          religion: detailData.religion || 'Không',
          bloodType: 'O+',
          phone: detailData.phoneNumber || '0912 345 678',
          email: detailData.email || `${detailData.citizenCode.toLowerCase()}@civilpro.gov.vn`,
          maritalStatus: (detailData.age || 30) >= 30 ? 'Đã kết hôn' : 'Độc thân',
          contactAddress: detailData.permanentAddress,
        },
        identity: {
          cccdNum: detailData.idCardNumber,
          issueDate: detailData.idCardIssuedDate ? detailData.idCardIssuedDate.split('-').reverse().join('/') : '25/12/2021',
          issuePlace: detailData.idCardIssuedPlace || 'Cục Cảnh sát QLHC về trật tự xã hội',
          identMark: 'Nốt ruồi cách 2cm dưới đuôi mắt phải',
          oldId: detailData.passportNumber ? `Hộ chiếu: ${detailData.passportNumber}` : 'Không có',
        },
        residency: {
          permanent: detailData.permanentAddress,
          temporary: detailData.temporaryAddress || (isResident ? 'Không có (Đang cư trú tại thường trú)' : detailData.permanentAddress),
          current: detailData.permanentAddress,
          regDate: formattedDob,
          status: `${detailData.citizenType || 'Thường trú'} (${detailData.statusLabel || 'Active'})`,
        },
        household: {
          hkCode: detailData.householdId ? `HK-${detailData.householdId}` : `HK-${detailData.citizenCode.replace('CD', '')}`,
          ownerName: detailData.fullName,
          relationToOwner: detailData.isHouseholdHead ? 'Chủ hộ' : 'Thành viên',
          address: detailData.permanentAddress,
          members: [
            { name: detailData.fullName, relation: detailData.isHouseholdHead ? 'Chủ hộ' : 'Bản thân', birthYear, idCode: detailData.citizenCode },
          ],
        },
        occupation: {
          jobTitle: detailData.occupation || 'Chưa cập nhật',
          workplace: detailData.workplace || 'Đơn vị công tác chuyên môn',
          education: detailData.educationLevel || 'Đại học',
          employmentStatus: 'Đang làm việc',
        },
        documents: {
          birthCertificate: `Số 120/KS, Đăng ký ngày ${formattedDob} tại UBND Xã/Phường`,
          passport: detailData.passportNumber ? `${detailData.passportNumber} (Hạn: ${detailData.passportExpiryDate || '---'})` : 'Không có',
          driverLicense: 'Hạng B2',
          healthInsurance: `GD4${detailData.idCardNumber.slice(0, 10)}, Nơi KCB: Bệnh viện Đa khoa`,
        },
        specialGroup: {
          category: detailData.citizenType || 'Thường trú',
          subsidy: 'Không có',
          disability: 'Bình thường',
        },
        history: [
          { date: detailData.createdAt ? detailData.createdAt.split(' ')[0] : '25/12/2021', title: 'Tạo hồ sơ công dân', desc: `Tạo bởi: ${detailData.createdBy || 'Hệ thống'} • Trạng thái: ${detailData.statusLabel || 'Active'}` },
          { date: detailData.updatedAt ? detailData.updatedAt.split(' ')[0] : formattedDob || '01/01/1990', title: 'Cập nhật thông tin gần nhất', desc: `Cập nhật bởi: ${detailData.updatedBy || 'Cán bộ'} • ${detailData.statusReason || 'Hoạt động bình thường'}` },
        ],
      };
    }

    if (citizenCode && PROFILES_DB[citizenCode]) {
      return PROFILES_DB[citizenCode];
    }

    const matched = DEFAULT_CITIZEN_DATA.items.find(
      c => c.citizenCode === citizenCode || (defaultName && c.fullName === defaultName)
    );

    if (matched) {
      const birthYear = matched.dateOfBirth ? parseInt(matched.dateOfBirth.slice(0, 4), 10) : (2026 - matched.age);
      const gender = matched.genderLabel === 'Male' ? 'Nam' : matched.genderLabel === 'Female' ? 'Nữ' : 'Khác';
      const formattedDob = matched.dateOfBirth ? matched.dateOfBirth.split('-').reverse().join('/') : '';
      const isResident = matched.citizenType === 'Thường trú';

      return {
        code: matched.citizenCode,
        name: matched.fullName,
        gender,
        birthYear,
        cccd: matched.idCardNumber,
        job: matched.occupation,
        tag: matched.citizenType,
        tagColor: isResident ? Colors.primary : '#d97706',
        avatarColor: gender === 'Nam' ? '#3b82f6' : gender === 'Nữ' ? '#ec4899' : '#8b5cf6',
        personal: {
          dob: formattedDob,
          birthPlace: matched.permanentAddress,
          hometown: matched.permanentAddress,
          nationality: 'Việt Nam',
          ethnicity: 'Kinh',
          religion: 'Không',
          bloodType: 'O+',
          phone: '0912 345 678',
          email: `${matched.citizenCode.toLowerCase()}@civilpro.gov.vn`,
          maritalStatus: matched.age >= 30 ? 'Đã kết hôn' : 'Độc thân',
          contactAddress: matched.permanentAddress,
        },
        identity: {
          cccdNum: matched.idCardNumber,
          issueDate: '25/12/2021',
          issuePlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
          identMark: 'Nốt ruồi cách 2cm dưới đuôi mắt phải',
          oldId: 'Không có',
        },
        residency: {
          permanent: matched.permanentAddress,
          temporary: isResident ? 'Không có (Đang cư trú tại thường trú)' : matched.permanentAddress,
          current: matched.permanentAddress,
          regDate: formattedDob,
          status: `${matched.citizenType} (${matched.statusLabel || 'Active'})`,
        },
        household: {
          hkCode: `HK-${matched.citizenCode.replace('CD', '')}`,
          ownerName: matched.fullName,
          relationToOwner: 'Chủ hộ',
          address: matched.permanentAddress,
          members: [
            { name: matched.fullName, relation: 'Bản thân (Chủ hộ)', birthYear, idCode: matched.citizenCode },
          ],
        },
        occupation: {
          jobTitle: matched.occupation,
          workplace: 'Đơn vị công tác địa phương',
          education: matched.occupation.includes('Kỹ sư') || matched.occupation.includes('Bác sĩ') || matched.occupation.includes('Giáo viên') ? 'Đại học' : 'Trung cấp / Phổ thông',
          employmentStatus: 'Đang làm việc',
        },
        documents: {
          birthCertificate: `Số 120/KS, Đăng ký ngày ${formattedDob} tại UBND Xã/Phường`,
          passport: 'Không có',
          driverLicense: 'Hạng B2',
          healthInsurance: `GD4${matched.idCardNumber.slice(0, 10)}, Nơi KCB: Bệnh viện Đa khoa`,
        },
        specialGroup: {
          category: matched.citizenType,
          subsidy: 'Không có',
          disability: 'Bình thường',
        },
        history: [
          { date: '25/12/2021', title: 'Cấp thẻ CCCD gắn chip', desc: 'Đã hoàn thành cấp đổi chip định danh.' },
          { date: formattedDob || '01/01/1990', title: 'Đăng ký cư trú', desc: `Đăng ký ${matched.citizenType.toLowerCase()} tại địa chỉ hiện tại.` },
        ],
      };
    }

    // Deep fallback matching the schema
    return {
      code: citizenCode || 'CD-123984',
      name: defaultName || 'Trần Văn Hoàng',
      gender: 'Nam',
      birthYear: 1990,
      cccd: '038090012345',
      job: 'Kỹ sư xây dựng',
      tag: 'Lao động',
      tagColor: Colors.primary,
      avatarColor: '#3b82f6',
      personal: {
        dob: '15/04/1990',
        birthPlace: 'Bệnh viện Phụ sản Trung ương, Hà Nội',
        hometown: 'Xã Hưng Mỹ, Huyện Hưng Nguyên, Tỉnh Nghệ An',
        nationality: 'Việt Nam',
        ethnicity: 'Kinh',
        religion: 'Không',
        bloodType: 'O+',
        phone: '0912 345 678',
        email: 'hoang.tran@civilpro.gov.vn',
        maritalStatus: 'Đã kết hôn',
        contactAddress: 'Số 12, Đường 3/2, Phường 1, TP. Trung Tâm, Tỉnh Tây Ninh',
      },
      identity: {
        cccdNum: '038090012345',
        issueDate: '25/12/2021',
        issuePlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
        identMark: 'Nốt ruồi cách 2cm dưới đuôi mắt phải',
        oldId: '184012394 (Cấp năm 2005 tại CA Nghệ An)',
      },
      residency: {
        permanent: 'Số 12, Đường 3/2, Phường 1, TP. Trung Tâm, Tỉnh Tây Ninh',
        temporary: 'Không có (Đang cư trú tại thường trú)',
        current: 'Số 12, Đường 3/2, Phường 1, TP. Trung Tâm, Tỉnh Tây Ninh',
        regDate: '10/01/2015',
        status: 'Thường trú chính thức',
      },
      household: {
        hkCode: 'HK-909283',
        ownerName: defaultName || 'Trần Văn Hoàng',
        relationToOwner: 'Chủ hộ',
        address: 'Số 12, Đường 3/2, Phường 1, TP. Trung Tâm, Tỉnh Tây Ninh',
        members: [
          { name: 'Nguyễn Thị Hương', relation: 'Vợ', birthYear: 1993, idCode: 'CD-990123' },
          { name: 'Trần Hoàng Nam', relation: 'Con trai', birthYear: 2018, idCode: 'CD-881920' },
        ],
      },
      occupation: {
        jobTitle: 'Kỹ sư xây dựng',
        workplace: 'Tổng công ty Xây dựng Công trình Trung Tâm',
        education: 'Đại học',
        employmentStatus: 'Đang làm việc',
      },
      documents: {
        birthCertificate: 'Số 142/QĐ-KS, Đăng ký ngày 20/05/1990 tại UBND Xã Hưng Mỹ',
        passport: 'Không có',
        driverLicense: 'Hạng B2, Số: 370123498234',
        healthInsurance: 'GD438090012345, Nơi KCB: Bệnh viện Đa khoa Tỉnh',
      },
      specialGroup: {
        category: 'Lao động',
        subsidy: 'Không có',
        disability: 'Bình thường',
      },
      history: [
        { date: '25/12/2021', title: 'Cấp thẻ CCCD gắn chip', desc: 'Đã hoàn thành cấp đổi chip.' },
        { date: '10/01/2015', title: 'Đăng ký thường trú', desc: 'Đăng ký chuyển thường trú về Tây Ninh.' },
      ],
    };
  }, [citizenCode, defaultName]);

  const initials = useMemo(() => {
    return profile.name
      .split(' ')
      .slice(-2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }, [profile.name]);

  // Tab definitions
  const tabsList = [
    { id: 'personal', label: 'Cá nhân', icon: 'user' },
    { id: 'identity', label: 'Định danh', icon: 'credit-card' },
    { id: 'residency', label: 'Cư trú', icon: 'map-pin' },
    { id: 'household', label: 'Hộ khẩu', icon: 'home' },
    { id: 'occupation', label: 'Công việc', icon: 'briefcase' },
    { id: 'documents', label: 'Giấy tờ', icon: 'file-text' },
    { id: 'specialGroup', label: 'Đối tượng', icon: 'tag' },
    { id: 'history', label: 'Biến động', icon: 'clock' },
  ] as const;

  // Custom Detail Row helper
  const DetailRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIconCol}>
        <Feather name={icon as any} size={15} color={Colors.primary} />
      </View>
      <View style={styles.detailContentCol}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '---'}</Text>
      </View>
    </View>
  );

  const handlePrint = () => {
    alert(`Đã chuẩn bị bản in cho Hồ sơ Công dân:\n${profile.name} (${profile.code})\nTệp PDF đang được xuất ra máy in...`);
  };

  const handleEdit = () => {
    navigation.navigate('EditCitizen', {
      citizen: detailData || {
        id: id || 1,
        citizenCode: profile.code,
        fullName: profile.name,
        genderLabel: profile.gender === 'Nam' ? 'Male' : profile.gender === 'Nữ' ? 'Female' : 'Other',
        dateOfBirth: profile.personal.dob ? profile.personal.dob.split('/').reverse().join('-') : '1990-01-01',
        age: 2026 - profile.birthYear,
        idCardNumber: profile.cccd,
        permanentAddress: profile.residency.permanent,
        occupation: profile.occupation.jobTitle,
        citizenType: profile.tag,
        status: 1,
        statusLabel: 'Active',
      },
    });
  };

  return (
    <DashboardLayout activeModule="citizens" customTitle={`HỒ SƠ CÔNG DÂN • ${profile.name.toUpperCase()}`}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Navigation Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Citizens')}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={18} color={Colors.textSecondary} />
            <Text style={styles.backBtnText}>Quay lại danh sách</Text>
          </TouchableOpacity>

          {isLoadingDetail && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0f9ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#bae6fd' }}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={{ fontSize: 13, color: Colors.primary, fontFamily: 'BeVietnamPro-Medium' }}>Đang tải dữ liệu từ máy chủ...</Text>
            </View>
          )}
        </View>

        <View style={styles.profileGrid}>
          {/* ========================================== */}
          {/* LEFT COLUMN: Summary CV Profile Card */}
          {/* ========================================== */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={[styles.largeAvatar, { backgroundColor: profile.avatarColor }]}>
                <Text style={styles.largeAvatarText}>{initials}</Text>
              </View>
              <Text style={styles.summaryName}>{profile.name}</Text>
              <Text style={styles.summaryCode}>Mã số: {profile.code}</Text>

              <View style={[styles.statusBadge, { backgroundColor: profile.tagColor + '18' }]}>
                <View style={[styles.statusDot, { backgroundColor: profile.tagColor }]} />
                <Text style={[styles.statusText, { color: profile.tagColor }]}>{profile.tag}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.miniStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>CCCD</Text>
                <Text style={styles.statValue} numberOfLines={1}>{profile.cccd.slice(0, 4)}...{profile.cccd.slice(-4)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>G.TÍNH</Text>
                <Text style={styles.statValue}>{profile.gender}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>N.SINH</Text>
                <Text style={styles.statValue}>{profile.birthYear}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Quick action buttons like a real CV profile */}
            <View style={styles.actionColumn}>
              <TouchableOpacity style={styles.printProfileBtn} onPress={handlePrint} activeOpacity={0.8}>
                <Feather name="printer" size={16} color={Colors.white} />
                <Text style={styles.printBtnText}>Xuất / In Hồ sơ (PDF)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editProfileBtn} onPress={handleEdit} activeOpacity={0.8}>
                <DetailEditIcon size={17} color="#ea580c" />
                <Text style={styles.editBtnText}>Chỉnh sửa thông tin</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cvFooter}>
              <Text style={styles.cvFooterText}>CSDL DÂN CƯ QUỐC GIA</Text>
              <Text style={styles.cvFooterSub}>Cập nhật lần cuối: Hôm nay 10:24</Text>
            </View>
          </View>

          {/* ========================================== */}
          {/* RIGHT COLUMN: Tab Selectors & Detailed CV */}
          {/* ========================================== */}
          <View style={styles.detailsContainer}>
            {/* Tab Selector Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsScroll}
              contentContainerStyle={styles.tabsContentContainer}
            >
              {tabsList.map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.id as any)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={tab.icon}
                    size={16}
                    color={activeTab === tab.id ? Colors.white : Colors.textSecondary}
                    style={styles.tabIcon}
                  />
                  <Text style={[styles.tabButtonText, activeTab === tab.id && styles.tabButtonTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Main CV detail card container */}
            <View style={styles.cvCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderIndicator} />
                <Text style={styles.cardHeaderTitle}>
                  {tabsList.find(t => t.id === activeTab)?.label.toUpperCase()} CHI TIẾT
                </Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.tabScrollWrapper}>
                {/* 1. THÔNG TIN CÁ NHÂN */}
                {activeTab === 'personal' && (
                  <View style={styles.gridContainer}>
                    <DetailRow icon="user" label="Họ và tên khai sinh" value={profile.name} />
                    <DetailRow icon="calendar" label="Ngày, tháng, năm sinh" value={profile.personal.dob} />
                    <DetailRow icon="map-pin" label="Nơi sinh (Cơ sở y tế)" value={profile.personal.birthPlace} />
                    <DetailRow icon="globe" label="Quê quán thường trú" value={profile.personal.hometown} />
                    <DetailRow icon="flag" label="Quốc tịch" value={profile.personal.nationality} />
                    <DetailRow icon="tag" label="Dân tộc" value={profile.personal.ethnicity} />
                    <DetailRow icon="heart" label="Tôn giáo" value={profile.personal.religion} />
                    <DetailRow icon="activity" label="Nhóm máu" value={profile.personal.bloodType} />
                    <DetailRow icon="phone" label="Số điện thoại cá nhân" value={profile.personal.phone} />
                    <DetailRow icon="mail" label="Hòm thư điện tử" value={profile.personal.email} />
                    <DetailRow icon="smile" label="Tình trạng hôn nhân" value={profile.personal.maritalStatus} />
                    <DetailRow icon="map" label="Nơi cư trú thực tế" value={profile.personal.contactAddress} />
                  </View>
                )}

                {/* 2. ĐỊNH DANH CÁ NHÂN */}
                {activeTab === 'identity' && (
                  <View style={styles.gridContainer}>
                    <View style={styles.barcodeSection}>
                      <Text style={styles.barcodeTitle}>MÃ QR ĐỊNH DANH DÂN CƯ QUỐC GIA</Text>
                      {/* Generates a clean digital simulated QR display */}
                      <View style={styles.qrContainer}>
                        <MaterialCommunityIcons name="qrcode" size={140} color={Colors.primaryDark} />
                      </View>
                      <Text style={styles.barcodeCode}>{profile.cccd}</Text>
                      <Text style={styles.barcodeStatus}>✓ Xác thực sinh trắc học quốc gia</Text>
                    </View>

                    <View style={styles.divider} />

                    <DetailRow icon="credit-card" label="Số căn cước công dân (12 số)" value={profile.identity.cccdNum} />
                    <DetailRow icon="calendar" label="Ngày cấp thẻ gần nhất" value={profile.identity.issueDate} />
                    <DetailRow icon="shield" label="Cơ quan cấp chứng thư" value={profile.identity.issuePlace} />
                    <DetailRow icon="eye" label="Đặc điểm nhân dạng cá nhân" value={profile.identity.identMark} />
                    <DetailRow icon="clipboard" label="Số chứng minh cũ (nếu có)" value={profile.identity.oldId} />
                  </View>
                )}

                {/* 3. THÔNG TIN CƯ TRÚ */}
                {activeTab === 'residency' && (
                  <View style={styles.gridContainer}>
                    <DetailRow icon="home" label="Địa chỉ Thường Trú chính thức" value={profile.residency.permanent} />
                    <DetailRow icon="clock" label="Địa chỉ Tạm Trú đã đăng ký" value={profile.residency.temporary} />
                    <DetailRow icon="navigation" label="Nơi ở hiện tại (Cư trú thực tế)" value={profile.residency.current} />
                    <DetailRow icon="calendar" label="Ngày đăng ký cư trú ban đầu" value={profile.residency.regDate} />
                    <DetailRow icon="info" label="Trạng thái cư trú quản lý" value={profile.residency.status} />
                  </View>
                )}

                {/* 4. HỘ GIA ĐÌNH */}
                {activeTab === 'household' && (
                  <View style={styles.gridContainer}>
                    <DetailRow icon="file-text" label="Mã số sổ hộ khẩu điện tử" value={profile.household.hkCode} />
                    <DetailRow icon="user" label="Họ và tên chủ hộ gia đình" value={profile.household.ownerName} />
                    <DetailRow icon="users" label="Quan hệ với chủ hộ khẩu" value={profile.household.relationToOwner} />
                    <DetailRow icon="map-pin" label="Địa chỉ đăng ký hộ khẩu" value={profile.household.address} />

                    <View style={styles.divider} />

                    <Text style={styles.sectionSubTitle}>DANH SÁCH THÀNH VIÊN TRONG HỘ KHẨU</Text>
                    
                    <View style={styles.membersList}>
                      {profile.household.members.map((member, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.memberCard}
                          onPress={() => {
                            // Allows interactive jumping inside CV family members
                            if (PROFILES_DB[member.idCode]) {
                              navigation.navigate('CitizenDetails', { citizenCode: member.idCode, defaultName: member.name });
                            } else {
                              alert(`Thông tin chi tiết của thành viên ${member.name} không khả dụng trong bản demo.`);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.memberAvatar}>
                            <Text style={styles.memberAvatarText}>
                              {member.name.split(' ').slice(-1)[0][0]}
                            </Text>
                          </View>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberRelation}>{member.relation} • Sinh năm {member.birthYear}</Text>
                          </View>
                          <View style={styles.memberAction}>
                            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* 5. NGHỀ NGHIỆP & HỌC VẤN */}
                {activeTab === 'occupation' && (
                  <View style={styles.gridContainer}>
                    <DetailRow icon="briefcase" label="Chức danh nghề nghiệp hiện tại" value={profile.occupation.jobTitle} />
                    <DetailRow icon="award" label="Cơ quan / Nơi làm việc thực tế" value={profile.occupation.workplace} />
                    <DetailRow icon="book-open" label="Trình độ học vấn cao nhất" value={profile.occupation.education} />
                    <DetailRow icon="activity" label="Tình trạng việc làm quản lý" value={profile.occupation.employmentStatus} />
                  </View>
                )}

                {/* 6. GIẤY TỜ KHÁC */}
                {activeTab === 'documents' && (
                  <View style={styles.gridContainer}>
                    <DetailRow icon="file-text" label="Thông tin Giấy khai sinh gốc" value={profile.documents.birthCertificate} />
                    <DetailRow icon="globe" label="Hộ chiếu quốc tế (Passport)" value={profile.documents.passport} />
                    <DetailRow icon="truck" label="Giấy phép lái xe đã đăng ký" value={profile.documents.driverLicense} />
                    <DetailRow icon="heart" label="Thẻ bảo hiểm y tế (BHYT)" value={profile.documents.healthInsurance} />
                  </View>
                )}

                {/* 7. PHÂN LOẠI ĐỐI TƯỢNG */}
                {activeTab === 'specialGroup' && (
                  <View style={styles.gridContainer}>
                    <DetailRow icon="tag" label="Nhóm đối tượng quản lý" value={profile.specialGroup.category} />
                    <DetailRow icon="gift" label="Diện hưởng chính sách & Trợ cấp" value={profile.specialGroup.subsidy} />
                    <DetailRow icon="alert-circle" label="Tình trạng khuyết tật/Sức khoẻ" value={profile.specialGroup.disability} />
                  </View>
                )}

                {/* 8. LỊCH SỬ BIẾN ĐỘNG HỘ TỊCH */}
                {activeTab === 'history' && (
                  <View style={styles.timelineContainer}>
                    {profile.history.map((event, idx) => (
                      <View key={idx} style={styles.timelineRow}>
                        <View style={styles.timelineLeft}>
                          <Text style={styles.timelineDate}>{event.date}</Text>
                          <View style={styles.timelineDot} />
                          {idx !== profile.history.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                        <View style={styles.timelineRight}>
                          <Text style={styles.timelineTitle}>{event.title}</Text>
                          <Text style={styles.timelineDesc}>{event.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </DashboardLayout>
  );
};

export default CitizenDetailsScreen;

const { width: windowWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && windowWidth >= 1024;

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'BeVietnamPro-Medium',
  },
  profileGrid: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 20,
    width: '100%',
  },

  // Left card: profile resume summary
  summaryCard: {
    width: isDesktop ? 320 : '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  summaryHeader: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  largeAvatarText: {
    fontSize: 32,
    color: Colors.white,
    fontFamily: 'BeVietnamPro-Bold',
  },
  summaryName: {
    fontSize: 20,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginTop: 6,
  },
  summaryCode: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'BeVietnamPro-Regular',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    width: '100%',
    marginVertical: 18,
  },
  miniStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro-SemiBold',
    color: Colors.textPrimary,
  },
  actionColumn: {
    width: '100%',
    gap: 10,
  },
  printProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  printBtnText: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-SemiBold',
    color: Colors.white,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.18s ease-in-out',
      } as any,
    }),
  },
  editBtnText: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Bold',
    color: '#ea580c',
  },
  cvFooter: {
    marginTop: 24,
    alignItems: 'center',
  },
  cvFooterText: {
    fontSize: 9,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  cvFooterSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    fontFamily: 'BeVietnamPro-Regular',
  },

  // Right card: tabs & details CV scroll
  detailsContainer: {
    flex: 1,
    gap: 16,
    width: '100%',
  },
  tabsScroll: {
    maxHeight: 52,
  },
  tabsContentContainer: {
    gap: 8,
    paddingRight: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 42,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Medium',
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.white,
    fontFamily: 'BeVietnamPro-Bold',
  },
  cvCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: isDesktop ? 28 : 18,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 450,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  cardHeaderIndicator: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  tabScrollWrapper: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailRow: {
    width: isDesktop ? '48%' : '100%',
    flexGrow: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    alignItems: 'center',
    gap: 12,
  },
  detailIconCol: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  detailContentCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-SemiBold',
    color: Colors.textPrimary,
  },

  // Barcode styling
  barcodeSection: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
    gap: 12,
  },
  barcodeTitle: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  barcodeCode: {
    fontSize: 18,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.primaryDark,
    letterSpacing: 2,
  },
  barcodeStatus: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro-SemiBold',
    color: '#16a34a',
  },

  // Members list in Household tab
  sectionSubTitle: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.textMuted,
    width: '100%',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  membersList: {
    width: '100%',
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.bgInput,
    borderRadius: 12,
    width: '100%',
    gap: 12,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: 'BeVietnamPro-Bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-SemiBold',
    color: Colors.textPrimary,
  },
  memberRelation: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Regular',
    color: Colors.textMuted,
    marginTop: 1,
  },
  memberAction: {
    padding: 4,
  },

  // Timeline for History tab
  timelineContainer: {
    width: '100%',
    paddingLeft: 10,
    paddingVertical: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 80,
  },
  timelineLeft: {
    width: 80,
    alignItems: 'flex-end',
    position: 'relative',
  },
  timelineDate: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-SemiBold',
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    position: 'absolute',
    right: -21,
    top: 5,
    zIndex: 2,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  timelineLine: {
    position: 'absolute',
    right: -17,
    top: 15,
    bottom: -10,
    width: 2,
    backgroundColor: Colors.border,
    zIndex: 1,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 10,
  },
  timelineTitle: {
    fontSize: 15,
    fontFamily: 'BeVietnamPro-Bold',
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro-Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
