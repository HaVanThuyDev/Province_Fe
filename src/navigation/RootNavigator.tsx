// ============================================================
// ROOT NAVIGATOR
// Điều hướng gốc: Auth stack / Dashboard với cấu hình web URL linking
// ============================================================

import React from 'react';
import { NavigationContainer, getStateFromPath } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { selectIsLoggedIn } from '../store/auth/authSlice';
import LoginScreen         from '../features/auth/screens/LoginScreen';
import DashboardScreen     from '../features/dashboard/screens/DashboardScreen';
import AdminUnitsScreen    from '../features/dashboard/screens/AdminUnitsScreen';
import AddAdminUnitScreen  from '../features/dashboard/screens/AddAdminUnitScreen';
import CitizensScreen      from '../features/dashboard/screens/CitizensScreen';
import AddCitizenScreen    from '../features/dashboard/screens/AddCitizenScreen';
import EditCitizenScreen   from '../features/dashboard/screens/EditCitizenScreen';
import CitizenDetailsScreen from '../features/dashboard/screens/CitizenDetailsScreen';
import HouseholdsScreen    from '../features/dashboard/screens/HouseholdsScreen';
import AddHouseholdScreen  from '../features/dashboard/screens/AddHouseholdScreen';
import ResidencyScreen     from '../features/dashboard/screens/ResidencyScreen';
import AddResidencyScreen  from '../features/dashboard/screens/AddResidencyScreen';
import DynamicsScreen      from '../features/dashboard/screens/DynamicsScreen';
import SpecialGroupsScreen from '../features/dashboard/screens/SpecialGroupsScreen';
import ReportsScreen       from '../features/dashboard/screens/ReportsScreen';
import GisScreen           from '../features/dashboard/screens/GisScreen';
import SystemScreen        from '../features/dashboard/screens/SystemScreen';
import PaymentScreen       from '../features/dashboard/screens/PaymentScreen';
import SyncScreen          from '../features/dashboard/screens/SyncScreen';

export type RootStackParamList = {
  Login         : undefined;
  Dashboard     : undefined;
  AdminUnits    : undefined;
  AddAdminUnit  : undefined;
  Citizens      : undefined;
  AddCitizen    : undefined;
  EditCitizen   : { citizen?: any };
  CitizenDetails: { citizenCode?: string; defaultName?: string; id?: number };
  Households    : undefined;
  AddHousehold  : undefined;
  Residency     : undefined;
  AddResidency  : undefined;
  Payment       : undefined;
  Sync          : undefined;
  Dynamics      : undefined;
  SpecialGroups : undefined;
  Reports       : undefined;
  Gis           : undefined;
  System        : undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:19006',
    'http://127.0.0.1:8081',
    'cudan://',
    '/',
  ],
  config: {
    initialRouteName: 'Login' as const,
    screens: {
      Login: 'login',
      Dashboard: 'dashboard',
      AdminUnits: 'administrative-unit',
      AddAdminUnit: 'administrative/add',
      Citizens: 'citizens',
      AddCitizen: 'citizens/add',
      EditCitizen: 'citizens/edit',
      CitizenDetails: 'citizens/details/:citizenCode',
      Households: 'households',
      AddHousehold: 'households/add',
      Residency: 'residency',
      AddResidency: 'residency/add',
      Payment: 'payment',
      Sync: 'sync',
      Dynamics: 'dynamics',
      SpecialGroups: 'special-groups',
      Reports: 'reports',
      Gis: 'gis',
      System: 'system',
    },
  },
  getStateFromPath: (path: string, options: any) => {
    const cleanPath = path.replace(/^\/+/, '').split('?')[0].trim().toLowerCase();
    const hasSession = typeof window !== 'undefined' && !!window.localStorage?.getItem('cudan_auth_session');

    // Nếu không có session đăng nhập, luôn ưu tiên route Login (/login)
    if (!hasSession) {
      return { routes: [{ name: 'Login' }] };
    }

    // Nếu đã đăng nhập và vào trang gốc ('/' hoặc '')
    if (!cleanPath) {
      return { routes: [{ name: 'Dashboard' }] };
    }
    // Đường dẫn login
    if (cleanPath === 'login') {
      return { routes: [{ name: hasSession ? 'Dashboard' : 'Login' }] };
    }
    // Đường dẫn dashboard
    if (cleanPath === 'dashboard' || cleanPath === 'dasbroast') {
      return { routes: [{ name: 'Dashboard' }] };
    }

    const state = getStateFromPath(path, options);
    return state || { routes: [{ name: hasSession ? 'Dashboard' : 'Login' }] };
  },
};

const RootNavigator: React.FC = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            {/* Đảm bảo nếu truy cập /login khi đã đăng nhập thì tự động mở Dashboard */}
            <Stack.Screen name="Login" component={DashboardScreen} />
            <Stack.Screen name="AdminUnits" component={AdminUnitsScreen} />
            <Stack.Screen 
              name="AddAdminUnit" 
              component={AddAdminUnitScreen} 
              options={{ presentation: 'transparentModal', animation: 'none' }}
            />
            <Stack.Screen name="Citizens" component={CitizensScreen} />
            <Stack.Screen name="CitizenDetails" component={CitizenDetailsScreen} />
            <Stack.Screen 
              name="AddCitizen" 
              component={AddCitizenScreen} 
              options={{ presentation: 'transparentModal', animation: 'none' }}
            />
            <Stack.Screen 
              name="EditCitizen" 
              component={EditCitizenScreen} 
              options={{ presentation: 'transparentModal', animation: 'none' }}
            />
            <Stack.Screen name="Households" component={HouseholdsScreen} />
            <Stack.Screen 
              name="AddHousehold" 
              component={AddHouseholdScreen} 
              options={{ presentation: 'transparentModal', animation: 'none' }}
            />
            <Stack.Screen name="Residency" component={ResidencyScreen} />
            <Stack.Screen 
              name="AddResidency" 
              component={AddResidencyScreen} 
              options={{ presentation: 'transparentModal', animation: 'none' }}
            />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Sync" component={SyncScreen} />
            <Stack.Screen name="Dynamics" component={DynamicsScreen} />
            <Stack.Screen name="SpecialGroups" component={SpecialGroupsScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Gis" component={GisScreen} />
            <Stack.Screen name="System" component={SystemScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* Đảm bảo nếu truy cập /dashboard khi chưa đăng nhập thì tự động chuyển về Login */}
            <Stack.Screen name="Dashboard" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
