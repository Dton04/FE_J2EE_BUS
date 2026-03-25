'use client';
import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Bus, 
  Ticket, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  PieChart as PieChartIcon
} from 'lucide-react';

export default function AdminStatisticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for statistics
  const stats = [
    { label: 'Tổng doanh thu', value: '1.248M VNĐ', icon: TrendingUp, trend: '+12.5%', isUp: true, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Vé đã bán', value: '4,582', icon: Ticket, trend: '+5.2%', isUp: true, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Khách hàng mới', value: '1,248', icon: Users, trend: '+10.1%', isUp: true, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Chuyến xe hoàn tất', value: '856', icon: Bus, trend: '-2.4%', isUp: false, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const revenueData = [
    { label: 'T2', value: 45 },
    { label: 'T3', value: 52 },
    { label: 'T4', value: 48 },
    { label: 'T5', value: 70 },
    { label: 'T6', value: 65 },
    { label: 'T7', value: 85 },
    { label: 'CN', value: 95 },
  ];

  const routePerformance = [
    { route: 'Hà Nội - Sapa', bookings: 450, growth: '+15%' },
    { route: 'Sài Gòn - Đà Lạt', bookings: 380, growth: '+8%' },
    { route: 'Đà Nẵng - Huế', bookings: 220, growth: '-2%' },
    { route: 'Hà Nội - Hải Phòng', bookings: 310, growth: '+12%' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            Thống kê & Báo cáo
          </h1>
          <p className="text-sm text-gray-500 mt-1">Phân tích hiệu quả kinh doanh và dữ liệu vận hành.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
            {['24h', '7d', '30d', 'All'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  timeRange === range 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-blue-600 hover:shadow-md transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-xl hover:shadow-gray-100 transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${stat.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {stat.trend}
                  {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                <div className="text-3xl font-black text-gray-900 mt-1 tracking-tight">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-800">Biểu đồ Doanh thu</h2>
              <p className="text-xs text-gray-400 font-medium">Theo dõi tăng trưởng doanh thu hàng ngày</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                <span className="text-xs font-bold text-gray-500 uppercase">Thực tế</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-100 rounded-full"></span>
                <span className="text-xs font-bold text-gray-500 uppercase">Dự kiến</span>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-4 pt-4">
            {revenueData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full flex flex-col items-center justify-end h-full relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none mb-2 shadow-lg">
                    {d.value}M
                  </div>
                  <div 
                    className="w-full bg-blue-50 rounded-t-xl group-hover:bg-blue-100 transition-colors absolute bottom-0" 
                    style={{ height: '90%' }}
                  ></div>
                  <div 
                    className="w-full bg-[#2474E5] rounded-t-xl shadow-lg shadow-blue-200 group-hover:scale-x-105 transition-all relative z-10" 
                    style={{ height: `${d.value}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-gray-400 group-hover:text-blue-600 transition-colors">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route Performance */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          <div className="mb-8">
            <h2 className="text-xl font-black text-gray-800">Tuyến đường Hot</h2>
            <p className="text-xs text-gray-400 font-medium">Top 5 tuyến có lượng đặt vé cao nhất</p>
          </div>

          <div className="space-y-6">
            {routePerformance.map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{item.route}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.growth.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-50'}`}>{item.growth}</span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full shadow-sm group-hover:brightness-110 transition-all" 
                    style={{ width: `${(item.bookings / 500) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.bookings} lượt đặt</span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase">Mục tiêu: 500</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-bold text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
            Xem báo cáo chi tiết →
          </button>
        </div>
      </div>

      {/* Analytics Insight */}
      <div className="bg-[#2474E5] p-8 rounded-[2.5rem] shadow-xl shadow-blue-200 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest">
            <Calendar size={12} /> Báo cáo tháng 3
          </div>
          <h2 className="text-3xl font-black tracking-tight">Hiệu suất vận hành đạt 94.5%</h2>
          <p className="text-blue-100 text-sm max-w-xl font-medium">
            Hệ thống ghi nhận sự tăng trưởng ổn định ở các tuyến phía Bắc. Đề xuất bổ sung thêm 
            chuyến vào khung giờ vàng (19h - 22h) để tối ưu hóa doanh thu.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-transform">
            Xuất file PDF
          </button>
          <button className="px-5 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm transition-all border border-white/20">
            Cài đặt cảnh báo
          </button>
        </div>
      </div>
    </div>
  );
}
