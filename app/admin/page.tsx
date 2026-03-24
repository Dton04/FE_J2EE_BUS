'use client';
import { 
  Users, 
  Bus, 
  Ticket, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Tổng doanh thu', value: '1.248.000.000đ', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12.5%', isUp: true },
    { label: 'Tổng số chuyến', value: '458', icon: Bus, color: 'text-orange-600', bg: 'bg-orange-100', trend: '+5.2%', isUp: true },
    { label: 'Đơn hàng mới', value: '24', icon: Ticket, color: 'text-green-600', bg: 'bg-green-100', trend: '+10.1%', isUp: true },
    { label: 'Người dùng mới', value: '124', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', trend: '-2.4%', isUp: false },
  ];

  const recentBookings = [
    { id: '#BK8801', customer: 'Nguyễn Văn A', route: 'Hà Nội - Sapa', date: '2024-03-24', amount: '250.000đ', status: 'Thành công' },
    { id: '#BK8802', customer: 'Trần Thị B', route: 'Sài Gòn - Đà Lạt', date: '2024-03-24', amount: '380.000đ', status: 'Chờ thanh toán' },
    { id: '#BK8803', customer: 'Lê Văn C', route: 'Đà Nẵng - Huế', date: '2024-03-24', amount: '120.000đ', status: 'Đã hủy' },
    { id: '#BK8804', customer: 'Phạm Minh D', route: 'Hà Nội - Hải Phòng', date: '2024-03-24', amount: '220.000đ', status: 'Thành công' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <div className="text-sm text-gray-500">Hôm nay, 24 Tháng 3, 2024</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.isUp ? 'text-green-600' : 'text-red-500'}`}>
                  {stat.trend}
                  {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-lg">Đơn hàng gần đây</h2>
          <button className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Lộ trình</th>
                <th className="px-6 py-4">Ngày đặt</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map((bk, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{bk.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{bk.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{bk.route}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{bk.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{bk.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase ${
                      bk.status === 'Thành công' ? 'bg-green-100 text-green-700' :
                      bk.status === 'Chờ thanh toán' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {bk.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
