'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/authService';
import { useState } from 'react';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(3, 'Mật khẩu phải ít nhất 3 ký tự'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterModal({ onClose, onSwitchToLogin }: { onClose: () => void, onSwitchToLogin: () => void }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setErrorMsg('');
    setSuccessMsg('');
    console.log("Attempting register with:", data);
    try {
      const res = await authService.register(data);
      console.log("Register response:", res);
      setSuccessMsg('Đăng ký thành công! Đang chuyển sang đăng nhập...');
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err: any) {
      console.error("Register Error:", err);
      const detail = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      setErrorMsg(`Lỗi: ${detail}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Đăng ký</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black absolute right-6 top-6 text-2xl">&times;</button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-green-50 text-green-600 p-3 rounded text-sm border border-green-100">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input
              {...register('full_name')}
              className={`w-full p-3 border rounded-lg outline-none transition focus:border-blue-500 ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

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
              placeholder="Tạo mật khẩu"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!successMsg}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          Đã có tài khoản?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-600 font-medium hover:underline">
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}
