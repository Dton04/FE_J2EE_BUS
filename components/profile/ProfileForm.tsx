'use client';
import { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';

export default function ProfileForm() {
  const { setUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('Nam');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await authService.getProfile();
        setUserProfile(profile);
        setFullName(profile.full_name || '');
        setPhone(profile.phone || profile.phone_number || '');
        setBirthDate(profile.birth_date || '');
        setGender(profile.gender || 'Nam');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setUserProfile]);

  const handleSave = async () => {
    setMessage(null);
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile({
        full_name: fullName,
        phone,
      });
      const refreshed = {
        ...updated,
        phone: updated.phone || updated.phone_number || phone,
        phone_number: updated.phone_number || updated.phone || phone,
      };
      setUserProfile(refreshed);
      setFullName(refreshed.full_name || fullName);
      setPhone(refreshed.phone || phone);
      setBirthDate(refreshed.birth_date || birthDate);
      setGender(refreshed.gender || gender);
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công.' });
    } catch (error: unknown) {
      const responseMessage =
        typeof (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setMessage({ type: 'error', text: responseMessage || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#2474E5]" size={40} />
        <p className="text-gray-500 font-medium">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm p-6 lg:p-8">
      <div className="max-w-3xl flex flex-col gap-6">
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
        
        {/* Họ và tên */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-gray-600">
            Họ và tên<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5] transition"
          />
        </div>

        {/* Số điện thoại */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-gray-600">
            Số điện thoại<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5] transition"
          />
        </div>

        {/* Ngày sinh */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-gray-600">Ngày sinh</label>
          <div className="relative">
            <input
              type="date"
              title="Ngày sinh"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button type="button" title="Select Date" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Calendar size={20} />
            </button>
          </div>
        </div>

        {/* Giới tính */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-gray-600">Giới tính</label>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden h-11">
            {['Nam', 'Nữ', 'Khác'].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 text-[15px] font-medium transition-colors ${
                  gender === g
                    ? 'bg-[#2474E5] text-white border-none'
                    : 'bg-white text-gray-600 border-x border-gray-200 first:border-l-0 last:border-r-0 hover:bg-gray-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Lưu Button */}
        <div className="mt-8">
          <button 
            onClick={handleSave}
            disabled={isSaving || !fullName.trim() || !phone.trim()}
            className={`w-full font-semibold py-3 rounded-lg text-[15px] transition ${
              isSaving || !fullName.trim() || !phone.trim()
                ? 'bg-[#f2f2f2] text-gray-400 cursor-not-allowed'
                : 'bg-[#2474E5] text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

      </div>
    </div>
  );
}
