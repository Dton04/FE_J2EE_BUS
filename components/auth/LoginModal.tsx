'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(3, 'Mật khẩu phải ít nhất 3 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginModal({ onClose, onSwitchToRegister }: { onClose: () => void, onSwitchToRegister: () => void }) {
  const { setTokens, setUserProfile } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  function getErrorMessage(err: unknown, fallback = 'Đăng nhập thất bại') {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (typeof err === 'object') {
      const obj = err as Record<string, unknown>;
      const resp = obj.response as Record<string, unknown> | undefined;
      const dataMsg = resp?.data as Record<string, unknown> | undefined;
      const message = dataMsg?.message ?? obj['message'];
      if (typeof message === 'string') return message;
      try {
        return JSON.stringify(err);
      } catch {
        return fallback;
      }
    }
    return String(err);
  }

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg('');
    console.log("Attempting login with:", data);
    try {
      const res = await authService.login(data);
      console.log("Login response:", res);
      
      const accessToken = res.access_token;
      if (accessToken) {
        setTokens(accessToken, res.refresh_token ?? null);
        // fetch profile after login
          try {
            const profileRes = await authService.getProfile();
            setUserProfile(profileRes);
          } catch {
            console.error('Failed to fetch profile');
          }
        onClose();
      } else {
        setErrorMsg('Đăng nhập không trả về token. Vui lòng kiểm tra lại backend.');
      }
    } catch (err: unknown) {
       
      console.error('Login Error:', err);
      const detail = getErrorMessage(err, 'Đăng nhập thất bại');
      setErrorMsg(`Lỗi: ${detail}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Đăng nhập</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black absolute right-6 top-6 text-2xl">&times;</button>
        </div>
        
        {errorMsg && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              {...register('email')}
              className={`w-full p-3 border rounded-lg outline-none transition focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Nhập email của bạn"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input 
              type="password"
              {...register('password')}
              className={`w-full p-3 border rounded-lg outline-none transition focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
           Chưa có tài khoản?{' '}
           <button onClick={onSwitchToRegister} className="text-blue-600 font-medium hover:underline">
             Đăng ký ngay
           </button>
        </div>
      </div>
    </div>
  );
}
