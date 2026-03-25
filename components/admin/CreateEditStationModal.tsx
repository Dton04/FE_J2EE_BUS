'use client';
import { useEffect, useState } from 'react';
import { X, Loader2, MapPin } from 'lucide-react';
import { stationService, type StationResponse } from '@/services/stationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  station?: StationResponse | null;
}

export default function CreateEditStationModal({ isOpen, onClose, onSuccess, station }: Props) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (station) {
      setName(station.name || '');
      setCity(station.city || '');
      setAddress(station.address || '');
    } else {
      setName('');
      setCity('');
      setAddress('');
    }
  }, [station]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !city.trim() || !address.trim()) {
      setError('Vui lòng nhập đủ tên, thành phố và địa chỉ.');
      return;
    }
    setLoading(true);
    try {
      if (station) {
        await stationService.updateStation(station.id, { name: name.trim(), city: city.trim(), address: address.trim() });
      } else {
        await stationService.createStation({ name: name.trim(), city: city.trim(), address: address.trim() });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        typeof (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || 'Không thể lưu bến xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-[#2474E5]" />
            <h2 className="text-lg font-semibold text-gray-800">{station ? 'Sửa bến xe' : 'Thêm bến xe'}</h2>
          </div>
          <button onClick={onClose} title="Close" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên bến xe</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Bến xe Miền Đông mới"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="VD: TP. Hồ Chí Minh"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Q.9, TP Thủ Đức"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              required
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2474E5] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (<><Loader2 size={18} className="animate-spin" /> Đang lưu...</>) : station ? 'Cập nhật' : 'Thêm bến xe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
