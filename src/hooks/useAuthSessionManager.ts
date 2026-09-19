import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Platform } from 'react-native';
import {
  selectIsLoggedIn,
  updateActivity,
  checkSessionExpiry,
} from '../store/auth/authSlice';

/**
 * useAuthSessionManager
 * Quản lý phiên đăng nhập:
 * 1. Lắng nghe các tương tác chuột, phím, cuộn của người dùng để cập nhật mốc hoạt động gần nhất.
 * 2. Tự động kiểm tra định kỳ để đăng xuất nếu không có thao tác trong 30 phút.
 * 3. Kiểm tra ngay khi người dùng chuyển lại tab (focus / visibilitychange).
 */
export function useAuthSessionManager() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const lastDispatchedRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isLoggedIn) return;

    // Kiểm tra ngay khi hook mount
    dispatch(checkSessionExpiry());

    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    // Throttled handler: Cập nhật hoạt động tối đa 1 lần mỗi 15 giây
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastDispatchedRef.current > 15000) {
        lastDispatchedRef.current = now;
        dispatch(updateActivity());
      }
    };

    // Kiểm tra định kỳ mỗi 15 giây
    const intervalId = setInterval(() => {
      dispatch(checkSessionExpiry());
    }, 15000);

    // Khi người dùng quay lại tab sau một thời gian
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        dispatch(checkSessionExpiry());
      }
    };

    const handleWindowFocus = () => {
      dispatch(checkSessionExpiry());
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'pointerdown'];
    events.forEach(eventName => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(intervalId);
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [dispatch, isLoggedIn]);
}
