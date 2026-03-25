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
  X,
  FileText,
  Route,
  DollarSign,
  Clock,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function AdminStatisticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [showDetailReport, setShowDetailReport] = useState(false);



  // Mock data for different time ranges
  const dataByRange: Record<string, { label: string; value: number }[]> = {
    '24h': [
      { label: '00h', value: 10 }, { label: '04h', value: 5 }, { label: '08h', value: 35 },
      { label: '12h', value: 60 }, { label: '16h', value: 45 }, { label: '20h', value: 80 }, { label: '23h', value: 25 },
    ],
    '7d': [
      { label: 'T2', value: 45 }, { label: 'T3', value: 52 }, { label: 'T4', value: 48 },
      { label: 'T5', value: 70 }, { label: 'T6', value: 65 }, { label: 'T7', value: 85 }, { label: 'CN', value: 95 },
    ],
    '30d': [
      { label: 'W1', value: 150 }, { label: 'W2', value: 210 }, { label: 'W3', value: 180 }, { label: 'W4', value: 320 },
    ],
    'All': [
      { label: 'T1', value: 850 }, { label: 'T2', value: 920 }, { label: 'T3', value: 1248 },
    ],
  };

  // Mock data for summary stats by range
  const summaryStatsByRange: Record<string, any[]> = {
    '24h': [
      { label: 'Doanh thu (24h)', value: '42.5M VNĐ', icon: TrendingUp, trend: '+2.1%', isUp: true, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'Vé đã bán', value: '156', icon: Ticket, trend: '+1.2%', isUp: true, color: 'text-green-600', bg: 'bg-green-100' },
      { label: 'Khách hàng mới', value: '24', icon: Users, trend: '+5.0%', isUp: true, color: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'Chuyến xe', value: '18', icon: Bus, trend: '0%', isUp: true, color: 'text-orange-600', bg: 'bg-orange-100' },
    ],
    '7d': [
      { label: 'Tổng doanh thu', value: '1.248M VNĐ', icon: TrendingUp, trend: '+12.5%', isUp: true, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'Vé đã bán', value: '4,582', icon: Ticket, trend: '+5.2%', isUp: true, color: 'text-green-600', bg: 'bg-green-100' },
      { label: 'Khách hàng mới', value: '1,248', icon: Users, trend: '+10.1%', isUp: true, color: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'Chuyến xe hoàn tất', value: '856', icon: Bus, trend: '-2.4%', isUp: false, color: 'text-orange-600', bg: 'bg-orange-100' },
    ],
    '30d': [
      { label: 'Doanh thu tháng', value: '5.820M VNĐ', icon: TrendingUp, trend: '+18.2%', isUp: true, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'Vé đã bán', value: '18,240', icon: Ticket, trend: '+8.5%', isUp: true, color: 'text-green-600', bg: 'bg-green-100' },
      { label: 'Khách hàng mới', value: '4,102', icon: Users, trend: '+15.4%', isUp: true, color: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'Chuyến xe', value: '3,240', icon: Bus, trend: '+4.2%', isUp: true, color: 'text-orange-600', bg: 'bg-orange-100' },
    ],
    'All': [
      { label: 'Tổng tích lũy', value: '24.5B VNĐ', icon: TrendingUp, trend: '+25.0%', isUp: true, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'Tổng vé bán', value: '124,582', icon: Ticket, trend: '+10.2%', isUp: true, color: 'text-green-600', bg: 'bg-green-100' },
      { label: 'Tổng khách hàng', value: '32,148', icon: Users, trend: '+20.1%', isUp: true, color: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'Tổng chuyến xe', value: '15,640', icon: Bus, trend: '+5.4%', isUp: true, color: 'text-orange-600', bg: 'bg-orange-100' },
    ],
  };

  const routesByRange: Record<string, any[]> = {
    '24h': [
      { route: 'Hà Nội - Sapa', bookings: 12, growth: '+2%', revenue: '5.4M', occupancy: 85 },
      { route: 'Hà Nội - Hải Phòng', bookings: 15, growth: '+5%', revenue: '5.2M', occupancy: 92 },
      { route: 'HCM - Vũng Tàu', bookings: 20, growth: '+10%', revenue: '4.8M', occupancy: 95 },
    ],
    '7d': [
      { route: 'Hà Nội - Sapa', bookings: 450, growth: '+15%', revenue: '202.5M', occupancy: 90 },
      { route: 'Sài Gòn - Đà Lạt', bookings: 380, growth: '+8%', revenue: '190M', occupancy: 76 },
      { route: 'Hà Nội - Hải Phòng', bookings: 310, growth: '+12%', revenue: '108.5M', occupancy: 62 },
      { route: 'HCM - Nha Trang', bookings: 290, growth: '+6%', revenue: '145M', occupancy: 58 },
      { route: 'Đà Nẵng - Huế', bookings: 220, growth: '-2%', revenue: '66M', occupancy: 44 },
    ],
    '30d': [
      { route: 'Hà Nội - Sapa', bookings: 1850, growth: '+20%', revenue: '832M', occupancy: 92 },
      { route: 'HCM - Đà Lạt', bookings: 1520, growth: '+12%', revenue: '760M', occupancy: 84 },
      { route: 'Hà Nội - Hải Phòng', bookings: 1240, growth: '+15%', revenue: '434M', occupancy: 78 },
    ],
    'All': [
      { route: 'Tuyến Bắc - Nam', bookings: 15400, growth: '+25%', revenue: '12.4B', occupancy: 88 },
      { route: 'Hà Nội - Sapa', bookings: 12200, growth: '+18%', revenue: '5.5B', occupancy: 90 },
      { route: 'Sài Gòn - Đà Lạt', bookings: 9800, growth: '+15%', revenue: '4.9B', occupancy: 82 },
    ],
  };

  const stats = summaryStatsByRange[timeRange] || summaryStatsByRange['7d'];
  const routePerformance = routesByRange[timeRange] || routesByRange['7d'];

  const revenueData = dataByRange[timeRange as keyof typeof dataByRange] || dataByRange['7d'];

  const detailReportData = [
    { month: 'Tháng 1', revenue: '850M', tickets: 3200, trips: 640, customers: 890, growth: '+5%' },
    { month: 'Tháng 2', revenue: '920M', tickets: 3500, trips: 700, customers: 950, growth: '+8%' },
    { month: 'Tháng 3', revenue: '1.248M', tickets: 4582, trips: 856, customers: 1248, growth: '+12.5%' },
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
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none focus:outline-none focus:ring-0 ${
                  timeRange === range 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 active:bg-gray-100'
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

          <div className="h-64 flex items-stretch justify-between gap-4 px-4 pt-4">
            {revenueData.map((d, i) => {
              // Calculate height relative to max value in current set for better visualization
              const maxValue = Math.max(...revenueData.map(item => item.value));
              const heightPercent = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full">
                  <div className="w-full flex flex-col items-center justify-end h-full relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none mb-2 shadow-lg z-20">
                      {d.value}{timeRange === 'All' || timeRange === '30d' ? 'M' : ''}
                    </div>
                    <div 
                      className="w-full bg-blue-50 rounded-t-xl group-hover:bg-blue-100 transition-colors absolute bottom-0" 
                      style={{ height: '100%' }}
                    ></div>
                    <div 
                      className="w-full bg-[#2474E5] rounded-t-xl shadow-lg shadow-blue-100 group-hover:scale-x-105 transition-all duration-500 relative z-10" 
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 transition-colors">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route Performance */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-800">Tuyến đường Hot</h2>
            <p className="text-xs text-gray-400 font-medium">Top 5 tuyến có lượng đặt vé cao nhất</p>
          </div>

          <div className="space-y-5">
            {routePerformance.map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{item.route}</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.growth.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {item.growth}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full shadow-sm group-hover:brightness-110 transition-all ${
                      idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-purple-500' : idx === 2 ? 'bg-orange-400' : idx === 3 ? 'bg-green-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${item.occupancy}%` }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-[10px] font-bold text-gray-400">{item.bookings} lượt đặt</span>
                  <span className="text-[10px] font-bold text-gray-400">{item.revenue} VNĐ</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowDetailReport(true)}
            className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
          >
            <Eye size={16} />
            Xem báo cáo chi tiết
            <ChevronRight size={16} />
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

      {/* Detail Report Modal */}
      {showDetailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black">Báo cáo Chi tiết</h2>
                  <p className="text-blue-100 text-xs mt-0.5">Dữ liệu vận hành & doanh thu tổng hợp</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailReport(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8">
              {/* Summary Cards in Modal */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tổng doanh thu Q1', value: '3.018M', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Tổng vé bán ra', value: '11,282', icon: Ticket, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Tổng chuyến hoàn tất', value: '2,196', icon: Route, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Thời gian TB/chuyến', value: '4.2h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className={`${card.bg} rounded-2xl p-4`}>
                      <div className={`${card.color} mb-2`}><Icon size={20} /></div>
                      <div className="text-xl font-black text-gray-800">{card.value}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">{card.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Monthly Table */}
              <div>
                <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-600" /> Thống kê theo tháng (Quý 1/2026)
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Tháng</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Doanh thu</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Vé bán</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Chuyến</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Khách hàng</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Tăng trưởng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {detailReportData.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-4 font-bold text-gray-800">{row.month}</td>
                          <td className="px-5 py-4 font-black text-blue-600 text-right">{row.revenue}</td>
                          <td className="px-5 py-4 font-bold text-gray-700 text-right">{row.tickets}</td>
                          <td className="px-5 py-4 font-bold text-gray-700 text-right">{row.trips}</td>
                          <td className="px-5 py-4 font-bold text-gray-700 text-right">{row.customers}</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${row.growth.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {row.growth}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Route Detail Table */}
              <div>
                <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
                  <Route size={18} className="text-purple-600" /> Chi tiết theo Tuyến đường
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">#</th>
                        <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Tuyến đường</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Lượt đặt</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Doanh thu</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Lấp đầy</th>
                        <th className="text-right px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Tăng trưởng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {routePerformance.map((r, i) => (
                        <tr key={i} className="hover:bg-purple-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-black flex items-center justify-center">{i + 1}</span>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-800">{r.route}</td>
                          <td className="px-5 py-4 font-bold text-gray-700 text-right">{r.bookings}</td>
                          <td className="px-5 py-4 font-black text-blue-600 text-right">{r.revenue} VNĐ</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.occupancy}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-gray-500">{r.occupancy}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${r.growth.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {r.growth}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 font-medium">Dữ liệu cập nhật lần cuối: 25/03/2026</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetailReport(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Đóng
                </button>
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md">
                  <Download size={15} />
                  Xuất PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
