'use client';
import { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';

export default function ChangePasswordForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async () => {
    setMessage(null);
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const responseMessage =
        typeof (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setMessage({ type: 'error', text: responseMessage || 'Không thể đổi mật khẩu. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = oldPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm p-6 lg:p-8 text-black">
      <div className="max-w-3xl flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-2">Đổi mật khẩu</h2>

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-[14px] font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {message.text}
          </div>
        )}
        
        {/* Mật khẩu hiện tại */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-gray-600">
            Mật khẩu hiện tại<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5] transition"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-gray-600">
            Mật khẩu mới<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5] transition"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-gray-600">
            Xác nhận mật khẩu mới<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5] transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Lưu Button */}
        <div className="mt-8">
          <button 
            onClick={handleSave}
            disabled={isSaving || !isFormValid}
            className={`w-full font-semibold py-3 rounded-lg text-[15px] transition ${
              isSaving || !isFormValid
                ? 'bg-[#f2f2f2] text-gray-400 cursor-not-allowed'
                : 'bg-[#2474E5] text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Đang xử lý...
              </span>
            ) : 'Đổi mật khẩu'}
          </button>
        </div>

      </div>
    </div>
  );
}
