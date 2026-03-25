'use client';
import { useState } from 'react';
import { X, Bus, Hash, Users, Type, Loader2 } from 'lucide-react';
import { busService } from '@/services/busService';

interface CreateBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BusFormData {
  license_plate: string;
  total_seats: number | '';
  bus_type: string;
}

export default function CreateBusModal({ isOpen, onClose, onSuccess }: CreateBusModalProps) {
  const [formData, setFormData] = useState<BusFormData>({
    license_plate: '',
    total_seats: '',
    bus_type: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.license_plate || !formData.total_seats || !formData.bus_type) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await busService.createBus({
        license_plate: formData.license_plate,
        total_seats: Number(formData.total_seats),
        bus_type: formData.bus_type,
      });
      onSuccess();
      onClose();
      // Reset form
      setFormData({ license_plate: '', total_seats: '', bus_type: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Biển số xe đã tồn tại hoặc có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Bus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Thêm xe mới</h2>
              <p className="text-xs text-gray-400 mt-0.5">Gọi API POST /admin/buses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              ⚠️ {error}
            </div>
          )}

          {/* License Plate */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Hash size={15} className="text-blue-500" /> Biển số xe
            </label>
            <input
              required
              type="text"
              placeholder="VD: 29A-123.45"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm shadow-sm"
              value={formData.license_plate}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
            />
          </div>

          {/* Total Seats */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Users size={15} className="text-orange-500" /> Số ghế
            </label>
            <input
              required
              type="number"
              min="1"
              max="100"
              placeholder="VD: 45"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm shadow-sm"
              value={formData.total_seats}
              onChange={(e) => setFormData({ ...formData, total_seats: e.target.value ? Number(e.target.value) : '' })}
            />
          </div>

          {/* Bus Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Type size={15} className="text-green-500" /> Loại xe
            </label>
            <select
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm text-gray-700 shadow-sm appearance-none bg-no-repeat bg-[right_1rem_center]"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org.lucide.lucide.chevron-down\' /%3E%3C/svg%3E")' }}
              value={formData.bus_type}
              onChange={(e) => setFormData({ ...formData, bus_type: e.target.value })}
            >
              <option value="">-- Chọn loại xe --</option>
              <option value="Giường nằm">Giường nằm</option>
              <option value="Ghế ngồi">Ghế ngồi</option>
              <option value="Limousine">Limousine</option>
              <option value="Phòng nằm">Phòng nằm (VIP)</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2474E5] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Đang thêm xe...
                </>
              ) : (
                '✅ Thêm xe mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
