'use client';
import { useState } from 'react';
import { X, Loader2, BusFront } from 'lucide-react';
import { busService } from '@/services/busService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBusModal({ isOpen, onClose, onSuccess }: Props) {
  const [licensePlate, setLicensePlate] = useState('');
  const [totalSeats, setTotalSeats] = useState<number>(40);
  const [busType, setBusType] = useState<string>('Standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!licensePlate.trim() || !totalSeats || totalSeats <= 0) {
      setError('Vui lòng nhập biển số và số ghế hợp lệ.');
      return;
    }
    setLoading(true);
    try {
      await busService.createBus({
        license_plate: licensePlate.trim(),
        total_seats: Number(totalSeats),
        bus_type: busType.trim() || 'Standard',
      });
      onSuccess();
      onClose();
      setLicensePlate('');
      setTotalSeats(40);
      setBusType('Standard');
    } catch (err: unknown) {
      const msg =
        typeof (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || 'Không thể tạo xe bus. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <BusFront size={20} className="text-[#2474E5]" />
            <h2 className="text-lg font-semibold text-gray-800">Thêm xe bus</h2>
          </div>
          <button onClick={onClose} title="Close" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biển số</label>
            <input
              type="text"
              placeholder="VD: 29B-12345"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số ghế</label>
            <input
              type="number"
              min={10}
              max={60}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={totalSeats}
              onChange={(e) => setTotalSeats(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
            <input
              type="text"
              placeholder="VD: Limousine 34"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={busType}
              onChange={(e) => setBusType(e.target.value)}
            />
          </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2474E5] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (<><Loader2 size={18} className="animate-spin" /> Đang tạo...</>) : 'Thêm xe'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
