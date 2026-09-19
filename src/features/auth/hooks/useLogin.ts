import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { UserRole } from '../../../constants/auth.constants';
import { loginApi } from '../services/auth.service';
import { loginSuccess } from '../../../store/auth/authSlice';

interface LoginState {
  username      : string;
  password      : string;
  role          : UserRole;
  agreedToTerms : boolean;
  isLoading     : boolean;
  showModal     : boolean;
  usernameError : string;
  passwordError : string;
  errorMessage  : string;   // lỗi hiển thị qua Toast
}

const INITIAL_STATE: LoginState = {
  username      : '',
  password      : '',
  role          : UserRole.PROVINCE,
  agreedToTerms : false,
  isLoading     : false,
  showModal     : false,
  usernameError : '',
  passwordError : '',
  errorMessage  : '',
};

export function useLogin(onSuccess?: () => void) {
  const [state, setState] = useState<LoginState>(INITIAL_STATE);

  const dispatch = useDispatch();

  // Helper để cập nhật một field
  const set = useCallback(
    <K extends keyof LoginState>(key: K, value: LoginState[K]) =>
      setState(prev => ({ ...prev, [key]: value })),
    [],
  );

  const validate = (): boolean => {
    let valid = true;

    if (!state.username.trim()) {
      set('usernameError', 'Vui lòng nhập tên đăng nhập.');
      valid = false;
    } else {
      set('usernameError', '');
    }

    if (!state.password) {
      set('passwordError', 'Vui lòng nhập mật khẩu.');
      valid = false;
    } else if (state.password.length < 6) {
      set('passwordError', 'Mật khẩu phải có ít nhất 6 ký tự.');
      valid = false;
    } else {
      set('passwordError', '');
    }

    return valid;
  };

  // ── Submit ───────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    set('isLoading', true);
    set('errorMessage', '');
    const startTime = Date.now();

    try {
      const response = await loginApi({
        username: state.username.trim(),
        password: state.password,
        role    : state.role,
      });

      // Đảm bảo thời gian loading tối thiểu 500ms để hiệu ứng chuyển cảnh mượt mà
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }

      // Map BE response phẳng → Redux store
      dispatch(loginSuccess(response));
      onSuccess?.();
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }

      // Hiển thị lỗi qua Toast
      const msg = err?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.';
      set('errorMessage', msg);
    } finally {
      set('isLoading', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dispatch, onSuccess]);

  const handleFaceIdLogin = useCallback(async () => {
    set('isLoading', true);

    setTimeout(() => {
      set('isLoading', false);
      dispatch(loginSuccess({
        accessToken : 'mock-token-faceid',
        refreshToken: 'mock-refresh-faceid',
        tokenType   : 'Bearer',
        expiresIn   : 3600,
        userId      : 0,
        username    : 'faceid_user',
        fullName    : 'Người dùng Face ID',
        roles       : ['OFFICER'],
        authorities : [],
      }));
    }, 1000);
  }, [dispatch]);

  // ── Modal close → navigate ───────────────────────────────

  const handleModalClose = useCallback(() => {
    set('showModal', false);
    onSuccess?.();
  }, [onSuccess, set]);

  return {
    // State
    username      : state.username,
    password      : state.password,
    role          : state.role,
    agreedToTerms : state.agreedToTerms,
    isLoading     : state.isLoading,
    showModal     : state.showModal,
    usernameError : state.usernameError,
    passwordError : state.passwordError,
    errorMessage  : state.errorMessage,

    // Actions
    setUsername      : (v: string)   => set('username', v),
    setPassword      : (v: string)   => set('password', v),
    setRole          : (v: UserRole) => set('role', v),
    setAgreedToTerms : (v: boolean)  => set('agreedToTerms', v),
    clearError       : ()            => set('errorMessage', ''),
    handleSubmit,
    handleFaceIdLogin,
    handleModalClose,
  };
}
