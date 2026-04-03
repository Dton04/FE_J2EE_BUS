'use client';
import { useState, use, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Search, User, Phone, Bus,
  CheckCircle2, Clock, Loader2, AlertCircle, ScanLine, RefreshCw
} from 'lucide-react';
import { tripService } from '@/services/tripService';
import { ticketService } from '@/services/ticketService';

interface Passenger {
  id: number;
  passengerName: string;
  phone: string;
  seatNumber: string;
  price: number;
  ticketStatus: string;
  checkInStatus: string;
}

export default function StaffPassengersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ON_BOARD'>('ALL');
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const fetchPassengers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tripService.getPassengers(tripId);
      setPassengers(Array.isArray(data) ? data : []);
    } catch {
      setError('Không thể tải danh sách hành khách.');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetchPassengers(); }, [fetchPassengers]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCheckIn = async (p: Passenger) => {
    setCheckingIn(p.id);
    try {
      await ticketService.checkIn(p.id);
      setPassengers(prev => prev.map(x => x.id === p.id ? { ...x, checkInStatus: 'ON_BOARD' } : x));
      setToast({ msg: `Đã check-in: ${p.passengerName} - Ghế ${p.seatNumber}`, type: 'ok' });
    } catch {
      setToast({ msg: 'Check-in thất bại', type: 'err' });
    } finally {
      setCheckingIn(null);
    }
  };

  const filtered = passengers.filter(p => {
    const match = (p.passengerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm) ||
      (p.seatNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const byStatus = filterStatus === 'ALL' || p.checkInStatus === filterStatus;
    return match && byStatus;
  });

  const onBoard = passengers.filter(p => p.checkInStatus === 'ON_BOARD').length;
  const pending = passengers.filter(p => p.checkInStatus !== 'ON_BOARD' && p.ticketStatus === 'ACTIVE').length;
  const pct = passengers.length > 0 ? Math.round((onBoard / passengers.length) * 100) : 0;

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold ${toast.type === 'ok' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          {toast.type === 'ok' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <Link href="/staff" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-base text-white">Hành khách Chuyến #{tripId}</h1>
          <p className="text-xs text-blue-300">{onBoard}/{passengers.length} đã lên xe</p>
        </div>
        <button onClick={fetchPassengers} disabled={loading} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Progress */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-3 space-y-2">
        <div className="flex justify-between text-xs text-white/60">
          <span>Tien do check-in</span>
          <span className="font-bold text-white">{pct}% ({onBoard}/{passengers.length})</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'ON_BOARD'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
            >
              {s === 'ALL' ? `Tat ca (${passengers.length})` : s === 'ON_BOARD' ? `Len xe (${onBoard})` : `Cho (${pending})`}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Tìm tên, SDT, số ghế..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 outline-none focus:border-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Passenger list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/50">
            <Loader2 className="animate-spin" size={36} />
            <p className="text-sm">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
            <AlertCircle size={36} />
            <p className="text-sm">{error}</p>
            <button onClick={fetchPassengers} className="px-4 py-2 bg-red-500/20 rounded-xl text-sm font-bold">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
            <User size={40} />
            <p className="text-sm">Không có hành khách</p>
          </div>
        ) : (
          filtered.map(p => (
            <div
              key={p.id}
              className={`rounded-2xl p-4 border transition-all ${p.checkInStatus === 'ON_BOARD'
                ? 'bg-green-500/15 border-green-400/30'
                : 'bg-white/8 border-white/10'
                }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base uppercase flex-shrink-0 ${p.checkInStatus === 'ON_BOARD' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                  }`}>
                  {(p.passengerName || 'K').charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{p.passengerName || 'Khach le'}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <Phone size={10} /> {p.phone || 'N/A'}
                    </span>
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                      <Bus size={10} /> {p.seatNumber}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {p.checkInStatus === 'ON_BOARD' ? (
                    <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                      <CheckCircle2 size={18} /> Xong
                    </div>
                  ) : p.ticketStatus === 'ACTIVE' ? (
                    <button
                      onClick={() => handleCheckIn(p)}
                      disabled={checkingIn === p.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition disabled:opacity-60"
                    >
                      {checkingIn === p.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <ScanLine size={14} />
                      }
                      {checkingIn === p.id ? '...' : 'Check-in'}
                    </button>
                  ) : (
                    <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                      <Clock size={12} /> Hủy
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
