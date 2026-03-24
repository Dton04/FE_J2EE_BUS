'use client';
import { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';

export default function ProfileForm() {
  const { userProfile, setUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
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
        setPhone(profile.phone || '');
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
          <label className="text-[14px] text-gray-600">Số điện thoại</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Chưa có số điện thoại"
            disabled
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-[15px] text-gray-600 outline-none cursor-not-allowed"
          />
        </div>

        {/* Ngày sinh */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-gray-600">Ngày sinh</label>
          <div className="relative">
            <input
              type="text" // Using text to match standard UI placeholder style "YYYY MM DD"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              placeholder="VD: 2004 12 23"
              className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-[15px] focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5] transition"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
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
            disabled
            className="w-full bg-[#f2f2f2] text-gray-400 font-semibold py-3 rounded-lg text-[15px] cursor-not-allowed"
          >
            Lưu
          </button>
        </div>

      </div>
    </div>
  );
}
