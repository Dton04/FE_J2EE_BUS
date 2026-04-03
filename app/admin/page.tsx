'use client';
import {
  MoreVertical,
  Download,
  Plus,
  Wallet,
  Users,
  CalendarX2,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DashboardOverview, adminDashboardService } from '@/services/adminDashboardService';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardService.getOverview()
      .then((res) => setData(res))
      .catch((err) => console.error("Error fetching dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1200px] mx-auto text-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1e293b]">Tổng quan quản trị</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi hiệu suất vận hành hệ thống xe khách trong 24h qua.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <Download size={16} className="text-gray-500" />
            Xuất báo cáo
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1e1b4b] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm">
            <Plus size={16} />
            Chuyến xe mới
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doanh thu */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#e0f2fe] rounded-lg">
              <Wallet size={20} className="text-[#0284c7]" />
            </div>
            <div className={`text-sm font-bold flex items-center gap-1 ${data?.revenueGrowth && data.revenueGrowth >= 0 ? 'text-[#16a34a]' : 'text-red-500'}`}>
              {data?.revenueGrowth && data.revenueGrowth > 0 ? '+' : ''}{data?.revenueGrowth || 0}% ↗
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-1">Doanh thu hôm nay</div>
            <div className="text-2xl font-bold font-serif text-[#0f172a]">{formatCurrency(data?.todayRevenue || 0)}</div>
          </div>
        </div>

        {/* Tỷ lệ lấp đầy */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#e0e7ff] rounded-lg">
              <Users size={20} className="text-[#4f46e5]" />
            </div>
            <div className={`text-sm font-bold flex items-center gap-1 ${data?.fillRateGrowth && data.fillRateGrowth >= 0 ? 'text-[#16a34a]' : 'text-red-500'}`}>
              {data?.fillRateGrowth && data.fillRateGrowth > 0 ? '+' : ''}{data?.fillRateGrowth || 0}% ↗
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-1">Tỷ lệ lấp đầy bình quân</div>
            <div className="text-2xl font-bold font-serif text-[#0f172a]">{data?.avgFillRate || 0}%</div>
          </div>
        </div>

        {/* Số vé hủy */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#fee2e2] rounded-lg">
              <CalendarX2 size={20} className="text-[#dc2626]" />
            </div>
            <div className={`text-sm font-bold flex items-center gap-1 ${data?.cancelledGrowth && data.cancelledGrowth <= 0 ? 'text-[#dc2626]' : 'text-[#dc2626]'}`}>
              {data?.cancelledGrowth || 0}% ↘
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-1">Số vé hủy</div>
            <div className="text-2xl font-bold font-serif text-[#0f172a]">{data?.cancelledTickets || 0}</div>
          </div>
        </div>
      </div>

      {/* Chart and Quick Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Biểu đồ */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold font-serif text-[#1e293b]">Biểu đồ doanh thu theo tuần</h2>
            <button className="flex items-center gap-2 border border-gray-200 text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600">
              7 ngày qua <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex-1 min-h-[220px] relative border-b border-gray-100 pb-6 hidden md:flex items-end justify-between px-4">
            {/* SVG mock path to look like the chart */}
            <svg viewBox="0 0 600 200" className="absolute inset-0 w-full h-[80%] bottom-8 opacity-40">
              <path d="M 0 180 C 100 150, 150 160, 200 120 S 300 80, 400 90 S 500 50, 600 30" fill="none" stroke="#6366f1" strokeWidth="3" />
              <circle cx="0" cy="180" r="4" fill="#6366f1" />
              <circle cx="100" cy="155" r="4" fill="#6366f1" opacity="0" />
              <circle cx="200" cy="120" r="4" fill="#6366f1" />
              <circle cx="300" cy="100" r="4" fill="#6366f1" opacity="0" />
              <circle cx="400" cy="90" r="4" fill="#6366f1" />
              <circle cx="500" cy="65" r="4" fill="#6366f1" opacity="0" />
              <circle cx="600" cy="30" r="4" fill="#6366f1" />
            </svg>
            <div className="w-full flex justify-between px-2 pt-2 text-[#94a3b8] text-xs font-medium uppercase mt-auto absolute bottom-0">
               {data?.weeklyRevenue?.map(w => <span key={w.dayName} className={w.dayName === 'T5' ? 'text-[#1e1b4b] font-bold' : ''}>{w.dayName}</span>)}
            </div>
          </div>
        </div>

        {/* Quick Pricng */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 h-full flex flex-col">
          <h2 className="font-bold font-serif text-[#1e293b] mb-4">Điều chỉnh giá nhanh</h2>
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] mb-5 relative">
            <h3 className="text-sm font-bold text-[#1e3a8a] mb-1">Kế hoạch lễ 30/4 - 1/5</h3>
            <p className="text-xs text-gray-500 mb-3">Tự động tăng 30% giá vé các tuyến cao điểm.</p>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-white px-2 py-1 rounded-md border border-emerald-100 w-max inline-flex">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              Đang hiệu lực
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Chọn nhóm tuyến</label>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-200 text-sm font-medium rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-indigo-400">
                  <option>Tất cả các tuyến</option>
                  <option>Tuyến miền Nam</option>
                  <option>Tuyến miền Bắc</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-end gap-3 gap-y-4 pt-1">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Mức điều chỉnh (%)</label>
                <input type="number" defaultValue={10} className="w-full border border-gray-200 text-sm font-medium rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400" />
              </div>
              <button className="bg-[#1e1b4b] text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-slate-800 transition whitespace-nowrap">
                Áp dụng
              </button>
            </div>
          </div>

          <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-100">
             <span className="text-[11px] italic text-gray-400">Cập nhật lần cuối: 10 phút trước</span>
             <button className="text-[11px] font-bold text-[#1e1b4b] hover:underline">Xem lịch sử</button>
          </div>
        </div>
      </div>

      {/* Active Trips Table */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold font-serif text-[#1e293b]">Chuyến xe đang vận hành</h2>
          <button className="text-sm font-bold text-[#1e1b4b] hover:underline">Xem tất cả</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8fafc] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">MÃ CHUYẾN / LỘ TRÌNH</th>
                <th className="px-6 py-4">BIỂN SỐ XE</th>
                <th className="px-6 py-4">TÀI XẾ</th>
                <th className="px-6 py-4">KHỞI HÀNH</th>
                <th className="px-6 py-4">LẤP ĐẦY</th>
                <th className="px-6 py-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data?.activeTrips?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">Không có chuyến nào đang chạy</td>
                </tr>
              ) : null}
              {data?.activeTrips?.map((trip) => {
                 let barColor = 'bg-emerald-500';
                 const ratio = trip.filledSeats / (trip.totalSeats || 1);
                 if (ratio < 0.5) barColor = 'bg-rose-500';
                 else if (ratio < 0.8) barColor = 'bg-amber-400';

                 return (
                <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#1e293b] text-sm">{trip.tripCode}</div>
                    <div className="text-[11px] font-medium text-gray-400 uppercase mt-0.5">{trip.routeName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-[#334155] text-xs font-bold font-mono tracking-wider rounded border border-gray-200">
                      {trip.busPlate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase flex-shrink-0">
                        {trip.driverName !== 'Chưa xếp' ? trip.driverName.substring(0,2) : '?'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1e293b] leading-tight">{trip.driverName}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">09xxxxxx</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-medium">{trip.departureTime}</div>
                  </td>
                  <td className="px-6 py-4 max-w-[150px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${Math.max(ratio*100, 5)}%` }}></div>
                      </div>
                      <div className="text-xs font-bold text-[#334155] whitespace-nowrap min-w-[35px]">
                        {trip.filledSeats}/{trip.totalSeats}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <button className="text-gray-400 hover:text-indigo-600 transition">
                       <MoreVertical size={18} />
                     </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
