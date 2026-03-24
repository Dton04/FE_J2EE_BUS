'use client';
import { useState } from 'react';
import { X, MapPin, Navigation, Clock, Loader2, Route } from 'lucide-react';
import { routeService, RouteRequest } from '@/services/routeService';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRouteModal({ isOpen, onClose, onSuccess }: CreateRouteModalProps) {
  const [formData, setFormData] = useState<RouteRequest>({
    departure: '',
    destination: '',
    distance: 0,
    duration: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await routeService.createRoute(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo lộ trình');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Route size={24} />
             </div>
             <h2 className="text-xl font-bold text-gray-800">Thêm lộ trình mới</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 italic">
              * {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
               <MapPin size={16} className="text-[#2474E5]" /> 
               Điểm xuất phát
            </label>
            <input
              required
              type="text"
              placeholder="VD: Hà Nội"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition"
              value={formData.departure}
              onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
               <MapPin size={16} className="text-red-500" /> 
               Điểm đến
            </label>
            <input
              required
              type="text"
              placeholder="VD: Sapa"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <Navigation size={16} className="text-gray-400" /> 
                 Khoảng cách (km)
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="VD: 320"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition"
                value={formData.distance || ''}
                onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <Clock size={16} className="text-gray-400" /> 
                 Thời gian (phút)
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="VD: 360"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-4 text-xs text-gray-400 italic">
             * Lộ trình này sẽ được dùng để tạo các chuyến xe tương ứng.
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2474E5] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : (
                'Tạo lộ trình'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
