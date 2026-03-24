'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Phone,
  Shield,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react';
import { adminUserService, StaffResponse } from '@/services/adminUserService';
import CreateStaffModal from '@/components/admin/CreateStaffModal';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getAllStaff();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleLock = async (user: StaffResponse) => {
    try {
      setActionLoading(user.id);
      await adminUserService.updateUserLock(user.id, { locked: !user.locked });
      // Update local state instead of refetching for better UX
      setUsers(users.map(u => u.id === user.id ? { ...u, locked: !user.locked } : u));
    } catch (error) {
      console.error('Failed to toggle lock status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên & Khách hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Xem và quản lý thông tin tài khoản, trạng thái hoạt động của người dùng.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#2474E5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          <UserPlus size={20} />
          Thêm người dùng
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, sđt..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <Filter size={18} />
            Vai trò
          </button>
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 outline-none hover:bg-gray-50 transition font-medium">
            <option>Tất cả trạng thái</option>
            <option>Hoạt động</option>
            <option>Bị khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-500 font-medium">Đang tải dữ liệu người dùng...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <p className="text-gray-500 font-medium text-lg">Không tìm thấy người dùng nào</p>
              <p className="text-gray-400 text-sm">Hãy thử thay đổi từ khóa tìm kiếm</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Họ và tên</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 text-center">Đơn hàng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="text-sm font-bold text-gray-900">{user.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1 font-medium">
                        <Mail size={12} className="text-gray-400" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <Phone size={12} className="text-gray-400" /> {user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        {user.role === 'ADMIN' && <Shield size={14} className="text-orange-500" />}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">{user.bookingsCount ?? 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase ${
                        !user.locked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {!user.locked ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleLock(user)}
                          disabled={actionLoading === user.id}
                          className={`p-1.5 rounded transition-colors ${
                            user.locked 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-red-600 hover:bg-red-50'
                          }`} 
                          title={user.locked ? 'Mở khóa' : 'Khóa tài khoản'}
                        >
                          {actionLoading === user.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            user.locked ? <Unlock size={18} /> : <Lock size={18} />
                          )}
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Thêm thao tác">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">Hiển thị {filteredUsers.length} người dùng</div>
            <div className="flex items-center gap-1">
              <button className="p-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed"><ChevronLeft size={18}/></button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2474E5] text-white font-bold text-sm">1</button>
              <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>

      <CreateStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUsers} 
      />
    </div>
  );
}
